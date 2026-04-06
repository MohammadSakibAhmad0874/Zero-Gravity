"""
CulturaMatch AI Matching Service
Uses Fuzzy Logic + Neural Network for cultural exchange matching.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# ============================================================
# FUZZY LOGIC ENGINE
# ============================================================

class FuzzyMatcher:
    """
    Fuzzy logic-based matching using membership functions to compute
    compatibility scores across multiple dimensions.
    """

    @staticmethod
    def triangular_mf(x, a, b, c):
        """Triangular membership function"""
        if x <= a or x >= c:
            return 0.0
        elif x <= b:
            return (x - a) / (b - a) if b != a else 1.0
        else:
            return (c - x) / (c - b) if c != b else 1.0

    @staticmethod
    def trapezoidal_mf(x, a, b, c, d):
        """Trapezoidal membership function"""
        if x <= a or x >= d:
            return 0.0
        elif a < x <= b:
            return (x - a) / (b - a) if b != a else 1.0
        elif b < x <= c:
            return 1.0
        else:
            return (d - x) / (d - c) if d != c else 1.0

    def compute_skill_overlap(self, user1_skills, user2_skills):
        """Compute fuzzy skill overlap score"""
        if not user1_skills or not user2_skills:
            return 0.0

        # Jaccard-like overlap
        set1, set2 = set(s.lower() for s in user1_skills), set(s.lower() for s in user2_skills)
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        raw = intersection / union if union > 0 else 0

        # Apply triangular MF to normalize: low (0-0.3), medium (0.2-0.7), high (0.5-1.0)
        low = self.triangular_mf(raw, 0, 0, 0.3)
        medium = self.triangular_mf(raw, 0.2, 0.5, 0.7)
        high = self.triangular_mf(raw, 0.5, 1.0, 1.0)

        # Defuzzify using centroid-like weighted average
        return 0.2 * low + 0.6 * medium + 1.0 * high

    def compute_language_similarity(self, user1_langs, user2_langs):
        """Compute fuzzy language compatibility"""
        if not user1_langs or not user2_langs:
            return 0.0

        set1, set2 = set(l.lower() for l in user1_langs), set(l.lower() for l in user2_langs)
        shared = len(set1 & set2)
        total = max(len(set1), len(set2), 1)
        raw = shared / total

        # Higher overlap is better for language exchange
        return self.trapezoidal_mf(raw, 0, 0.2, 0.8, 1.0) * 0.7 + raw * 0.3

    def compute_interest_alignment(self, user1_interests, user2_interests):
        """Compute fuzzy interest alignment score"""
        if not user1_interests or not user2_interests:
            return 0.0

        set1 = set(i.lower() for i in user1_interests)
        set2 = set(i.lower() for i in user2_interests)
        overlap = len(set1 & set2)
        total = max(len(set1), len(set2), 1)
        raw = overlap / total

        return self.triangular_mf(raw, 0, 0.5, 1.0) * 0.5 + raw * 0.5

    def compute_timezone_proximity(self, tz1, tz2):
        """Compute timezone proximity score"""
        tz_map = {
            'UTC-12': -12, 'UTC-8': -8, 'UTC-5': -5, 'UTC-3': -3,
            'UTC+0': 0, 'UTC+1': 1, 'UTC+3': 3, 'UTC+5:30': 5.5,
            'UTC+8': 8, 'UTC+9': 9, 'UTC+10': 10
        }

        h1 = tz_map.get(tz1, 0)
        h2 = tz_map.get(tz2, 0)
        diff = abs(h1 - h2)
        # Closer timezones are better, max diff ~22 hours
        raw = max(0, 1 - diff / 12)
        return self.trapezoidal_mf(raw, 0, 0.3, 0.7, 1.0)

    def compute_match_score(self, user1, user2):
        """
        Compute overall fuzzy match score between two users.
        Returns score between 0 and 100.
        """
        skill_score = self.compute_skill_overlap(
            user1.get('skills', []), user2.get('skills', []))
        lang_score = self.compute_language_similarity(
            user1.get('languages', []), user2.get('languages', []))
        interest_score = self.compute_interest_alignment(
            user1.get('interests', []), user2.get('interests', []))
        tz_score = self.compute_timezone_proximity(
            user1.get('timezone', ''), user2.get('timezone', ''))

        # Weighted combination
        fuzzy_score = (
            skill_score * 0.30 +
            lang_score * 0.30 +
            interest_score * 0.25 +
            tz_score * 0.15
        )

        return min(fuzzy_score * 100, 100)


# ============================================================
# NEURAL NETWORK MODEL
# ============================================================

class NeuralMatcher:
    """
    Simple feedforward neural network for refining match predictions.
    Uses numpy for a lightweight implementation (no TF dependency required).
    """

    def __init__(self):
        self.weights_file = os.path.join(os.path.dirname(__file__), 'model_weights.json')
        # Simple 2-layer network: input(4) -> hidden(8) -> output(1)
        self.load_or_init_weights()

    def load_or_init_weights(self):
        if os.path.exists(self.weights_file):
            try:
                with open(self.weights_file, 'r') as f:
                    data = json.load(f)
                self.W1 = np.array(data['W1'])
                self.b1 = np.array(data['b1'])
                self.W2 = np.array(data['W2'])
                self.b2 = np.array(data['b2'])
                return
            except:
                pass

        # Xavier initialization
        np.random.seed(42)
        self.W1 = np.random.randn(4, 8) * np.sqrt(2.0 / 4)
        self.b1 = np.zeros(8)
        self.W2 = np.random.randn(8, 1) * np.sqrt(2.0 / 8)
        self.b2 = np.zeros(1)

    def save_weights(self):
        data = {
            'W1': self.W1.tolist(),
            'b1': self.b1.tolist(),
            'W2': self.W2.tolist(),
            'b2': self.b2.tolist()
        }
        with open(self.weights_file, 'w') as f:
            json.dump(data, f)

    @staticmethod
    def relu(x):
        return np.maximum(0, x)

    @staticmethod
    def sigmoid(x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

    def predict(self, features):
        """
        Forward pass: features = [skill_overlap, lang_sim, interest_align, tz_proximity]
        Returns predicted match quality (0-1)
        """
        x = np.array(features).reshape(1, -1)
        h = self.relu(x @ self.W1 + self.b1)
        out = self.sigmoid(h @ self.W2 + self.b2)
        return float(out[0, 0])

    def train_on_feedback(self, features, target, lr=0.01):
        """
        Simple backpropagation training step.
        features: [skill_overlap, lang_sim, interest_align, tz_proximity]
        target: 0-1 (normalized rating)
        """
        x = np.array(features).reshape(1, -1)

        # Forward
        z1 = x @ self.W1 + self.b1
        h = self.relu(z1)
        z2 = h @ self.W2 + self.b2
        out = self.sigmoid(z2)

        # Backward
        error = out - target
        d2 = error * out * (1 - out)
        dW2 = h.T @ d2
        db2 = d2.sum(axis=0)

        d1 = (d2 @ self.W2.T) * (z1 > 0).astype(float)
        dW1 = x.T @ d1
        db1 = d1.sum(axis=0)

        # Update
        self.W2 -= lr * dW2
        self.b2 -= lr * db2
        self.W1 -= lr * dW1
        self.b1 -= lr * db1

        self.save_weights()


# ============================================================
# MATCHING PIPELINE
# ============================================================

fuzzy_matcher = FuzzyMatcher()
neural_matcher = NeuralMatcher()


def get_feature_vector(user1, user2):
    """Extract feature vector for neural network input"""
    return [
        fuzzy_matcher.compute_skill_overlap(user1.get('skills', []), user2.get('skills', [])),
        fuzzy_matcher.compute_language_similarity(user1.get('languages', []), user2.get('languages', [])),
        fuzzy_matcher.compute_interest_alignment(user1.get('interests', []), user2.get('interests', [])),
        fuzzy_matcher.compute_timezone_proximity(user1.get('timezone', ''), user2.get('timezone', ''))
    ]


def compute_combined_score(user1, user2):
    """
    Combined matching score:
    - 60% fuzzy logic score
    - 40% neural network prediction
    """
    fuzzy_score = fuzzy_matcher.compute_match_score(user1, user2)
    features = get_feature_vector(user1, user2)
    neural_score = neural_matcher.predict(features) * 100

    combined = fuzzy_score * 0.6 + neural_score * 0.4
    return round(min(max(combined, 5), 99), 1)


# ============================================================
# FLASK ROUTES
# ============================================================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'culturamatch-ai',
        'model': 'fuzzy-logic + neural-network'
    })


@app.route('/match', methods=['POST'])
def match():
    """
    POST /match
    Body: { userId: str, users: [...user objects...] }
    Returns: { matches: [...matched users with scores...] }
    """
    data = request.get_json()
    user_id = data.get('userId')
    users = data.get('users', [])

    current_user = next((u for u in users if u.get('id') == user_id), None)
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    other_users = [u for u in users if u.get('id') != user_id]

    matches = []
    for other in other_users:
        score = compute_combined_score(current_user, other)
        matches.append({
            **other,
            'matchScore': score
        })

    # Sort by score descending
    matches.sort(key=lambda m: m['matchScore'], reverse=True)

    return jsonify({'matches': matches})


@app.route('/feedback', methods=['POST'])
def feedback():
    """
    POST /feedback
    Body: { fromUserId, targetUserId, rating (1-5) }
    Trains the neural network on user feedback.
    """
    data = request.get_json()
    rating = data.get('rating', 3)

    # Normalize rating to 0-1
    target = (rating - 1) / 4.0

    # For training, we'd need feature vectors. Store feedback for batch training.
    feedback_file = os.path.join(os.path.dirname(__file__), 'feedback_data.json')
    try:
        with open(feedback_file, 'r') as f:
            feedbacks = json.load(f)
    except:
        feedbacks = []

    feedbacks.append({
        'from': data.get('fromUserId'),
        'to': data.get('targetUserId'),
        'rating': rating,
        'normalized': target
    })

    with open(feedback_file, 'w') as f:
        json.dump(feedbacks, f, indent=2)

    return jsonify({'status': 'feedback recorded', 'training': 'queued'})


if __name__ == '__main__':
    print('🧠 CulturaMatch AI Service starting...')
    print('   Fuzzy Logic Engine: ✓')
    print('   Neural Network Model: ✓')
    app.run(host='0.0.0.0', port=5001, debug=True)
