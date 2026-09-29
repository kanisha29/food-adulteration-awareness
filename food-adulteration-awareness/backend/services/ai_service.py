"""Demo AI service for educational food-image screening.

This is a MOCK. It does not analyse the food. It derives repeatable, generic
"visual indicator" suggestions from the file bytes so the UI can be demonstrated.

To plug in a real model, implement `predict()` (see README, "Connect a real AI model")
and keep the response shape returned by `analyze_image()` unchanged.
"""
import hashlib
import config

INDICATORS = [
    ("Uneven colour distribution", "Patchy or unusually bright colour can sometimes indicate added dyes."),
    ("Unusual sheen or oily surface", "A greasy or glossy film may suggest coating or mixing with other substances."),
    ("Visible foreign particles", "Specks, grit or fibres that do not belong to the food."),
    ("Clumping or irregular texture", "Lumps can come from moisture, fillers or bulking agents."),
    ("Unnaturally vivid colour", "Colours far brighter than the natural product deserve caution."),
    ("Mixed grain or particle sizes", "Very different sizes in one sample may point to bulking with cheaper material."),
]
RECOMMENDATIONS = [
    "Compare the sample with a product from a trusted, licensed seller.",
    "Check the pack for an FSSAI licence number, batch number and expiry date.",
    "Try the simple home awareness checks on the Food Checker page.",
    "If you are still concerned, stop using the product and report it.",
    "Laboratory testing is the only way to confirm adulteration.",
]


def predict(image_bytes):
    """PLACEHOLDER: replace with a trained model. Return a score from 0 to 100."""
    digest = hashlib.sha256(image_bytes).digest()
    return 15 + digest[0] % 70, digest


def analyze_image(image_bytes, food_hint=""):
    score, digest = predict(image_bytes)
    picked = [INDICATORS[digest[i] % len(INDICATORS)] for i in (1, 2, 3)]
    unique = list({p[0]: p for p in picked}.values())
    level = "Low" if score < 35 else "Moderate" if score < 60 else "Elevated"
    return {
        "mode": "demo",
        "food_hint": food_hint,
        "indicator_level": level,
        "confidence": score,
        "indicators": [{"title": t, "detail": d} for t, d in unique],
        "recommendations": RECOMMENDATIONS[:4],
        "note": "Demo result: no trained model is connected. An image alone cannot confirm adulteration.",
        "disclaimer": config.DISCLAIMER,
    }
