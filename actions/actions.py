from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


INDUSTRY_SKILLS = {
    "technology": [
        "JavaScript", "TypeScript", "React", "Python", "Node.js", "HTML", "CSS",
        "SQL", "Git", "Java", "UI/UX", "Figma", "AWS", "Docker", "Agile"
    ],
    "hospitality": [
        "Food Safety", "ServSafe", "Menu Planning", "Kitchen Operations", "Culinary",
        "Customer Service", "POS", "Inventory", "Wine", "Bartending", "Catering",
        "Banquet", "Hotel", "Front Desk", "Housekeeping", "HACCP"
    ],
    "healthcare": [
        "Patient Care", "CPR", "BLS", "HIPAA", "EHR", "EMR", "Epic", "Clinical",
        "Nursing", "CNA", "Phlebotomy", "Vital Signs", "Medication Administration",
        "Triage", "Infection Control"
    ],
    "business": [
        "Excel", "QuickBooks", "Accounting", "Finance", "Marketing", "Sales",
        "Project Management", "CRM", "Salesforce", "Budgeting", "Operations",
        "Human Resources", "Business Analysis"
    ],
    "education": [
        "Lesson Planning", "Curriculum", "Classroom Management", "Teaching",
        "Assessment", "Special Education", "IEP", "ESL", "Google Classroom", "LMS"
    ],
    "trades": [
        "OSHA", "HVAC", "Electrical", "Plumbing", "Welding", "Carpentry",
        "Blueprint", "Maintenance", "Manufacturing", "Quality Control", "CDL", "Forklift"
    ],
    "creative": [
        "Photoshop", "Illustrator", "InDesign", "Adobe", "Graphic Design",
        "Video Editing", "Premiere", "Photography", "Copywriting", "Branding", "Figma"
    ],
}

INDUSTRY_SIGNALS = {
    "technology": [
        "software", "developer", "engineer", "programming", "javascript", "python",
        "frontend", "backend", "devops", "api", "git", "react", "typescript"
    ],
    "hospitality": [
        "chef", "cook", "kitchen", "culinary", "restaurant", "hotel", "hospitality",
        "server", "bartender", "barista", "catering", "banquet", "sous chef"
    ],
    "healthcare": [
        "nurse", "nursing", "patient", "clinical", "medical", "hospital", "cna", "emt"
    ],
    "business": [
        "accounting", "finance", "marketing", "sales", "business analyst", "quickbooks", "excel"
    ],
    "education": [
        "teacher", "teaching", "tutor", "education", "classroom", "curriculum", "professor"
    ],
    "trades": [
        "electrician", "plumber", "hvac", "carpenter", "welder", "mechanic", "construction", "osha"
    ],
    "creative": [
        "designer", "graphic design", "photography", "video editor", "illustrator", "adobe", "photoshop"
    ],
}

INDUSTRY_RECOMMENDATIONS = {
    "technology": "Focus on a portfolio project that demonstrates your strongest technical skills with measurable results.",
    "hospitality": "Highlight guest satisfaction, team leadership in service, and any food-safety or culinary certifications.",
    "healthcare": "Make sure licenses and certifications (CPR, state license) are current and clearly listed with dates.",
    "business": "Quantify your impact with revenue growth, cost savings, or efficiency improvements.",
    "education": "Include grade levels, subjects taught, and examples of improved student outcomes.",
    "trades": "List trade licenses, apprenticeships, and equipment you are certified to operate safely.",
    "creative": "Link to a portfolio showing range, process, and client or campaign results.",
    "general": "Add specific tools, achievements, and measurable outcomes so I can tailor recommendations to your field.",
}


class ActionSupportContext(Action):

    def name(self) -> Text:
        return "action_support_context"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        metadata = tracker.latest_message.get("metadata", {}) or {}
        industry_label = metadata.get("industry_label") or metadata.get("industry") or "your field"
        job_title = metadata.get("job_title") or "your next role"
        skills = metadata.get("extracted_skills") or "your strengths"
        focus_area = metadata.get("focus_area") or "building confidence and momentum"
        next_step = metadata.get("next_step") or "keep showing up and keep refining your plan"

        support_lines = [
            "I’m really glad you reached out, and I want to help in a warm, practical way.",
            f"Your profile points to {industry_label}, and your strengths in {skills} are genuinely valuable.",
            f"A gentle next focus for you is {focus_area}, especially as you move toward {job_title}.",
            f"One small step you can take today is: {next_step}.",
            "You do not have to do everything at once — we can take it one step at a time together.",
            "If you want, I can also help turn this into a calmer, more encouraging plan for today."
        ]

        dispatcher.utter_message(text="\n".join(support_lines))
        return []


class ActionResumeSummary(Action):

    def name(self) -> Text:
        return "action_resume_summary"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        metadata = tracker.latest_message.get("metadata", {}) or {}
        resume_text = metadata.get("resume_text", "")

        if not resume_text:
            dispatcher.utter_message(
                text="I couldn't read your resume data. Please upload a PDF, image, or text resume and try again."
            )
            return []

        industry = metadata.get("industry") or self.detect_industry(resume_text)
        industry_label = metadata.get("industry_label") or industry.replace("_", " ").title()
        skills = metadata.get("extracted_skills") or self.extract_skills(resume_text, industry)
        job_title = metadata.get("job_title") or self.infer_job_title(resume_text, industry)
        focus = metadata.get("focus_area") or self.build_focus(industry, skills)
        plan = metadata.get("next_step") or self.build_recommendation(industry, skills)

        dispatcher.utter_message(text="I scanned your resume successfully.")
        dispatcher.utter_message(text=f"Industry detected: {industry_label}.")
        dispatcher.utter_message(text=f"Recommended role: {job_title}.")
        dispatcher.utter_message(text=f"Top skills I found: {skills}.")
        dispatcher.utter_message(text=f"Focus area: {focus}")
        dispatcher.utter_message(text=plan)
        return []

    def detect_industry(self, text: Text) -> Text:
        lowered = text.lower()
        best_industry = "general"
        best_score = 0

        for industry, signals in INDUSTRY_SIGNALS.items():
            score = sum(1 for signal in signals if signal in lowered)
            if score > best_score:
                best_score = score
                best_industry = industry

        return best_industry

    def extract_skills(self, text: Text, industry: Text) -> Text:
        lowered = text.lower()
        keywords = list(INDUSTRY_SKILLS.get(industry, []))

        # Always scan all industries so mixed or unclear resumes still get matches
        for industry_keywords in INDUSTRY_SKILLS.values():
            keywords.extend(industry_keywords)

        seen = set()
        found: List[str] = []
        for keyword in keywords:
            key_lower = keyword.lower()
            if key_lower in lowered and key_lower not in seen:
                seen.add(key_lower)
                found.append(keyword)

        return ", ".join(found[:8]) if found else "Transferable skills — add industry-specific keywords for sharper matches"

    def infer_job_title(self, text: Text, industry: Text) -> Text:
        defaults = {
            "technology": "Junior Software Engineer",
            "hospitality": "Hospitality Professional",
            "healthcare": "Healthcare Support Professional",
            "business": "Business Professional",
            "education": "Education Professional",
            "trades": "Skilled Trades Professional",
            "creative": "Creative Professional",
            "general": "Entry-level Professional",
        }
        return defaults.get(industry, defaults["general"])

    def build_focus(self, industry: Text, skills: Text) -> Text:
        focus_map = {
            "technology": "Building technical depth and a strong project portfolio",
            "hospitality": "Service excellence and kitchen or guest operations",
            "healthcare": "Safe, compassionate patient care",
            "business": "Business impact and cross-functional collaboration",
            "education": "Student engagement and instructional quality",
            "trades": "Safety compliance and hands-on technical skill",
            "creative": "Visual storytelling and portfolio development",
            "general": "Clarifying your strongest experience and career direction",
        }
        return focus_map.get(industry, focus_map["general"])

    def build_recommendation(self, industry: Text, skills: Text) -> Text:
        base = INDUSTRY_RECOMMENDATIONS.get(industry, INDUSTRY_RECOMMENDATIONS["general"])

        if industry == "technology" and "React" in skills:
            return "Great React experience! Build a deployed portfolio project showcasing component architecture and testing."
        if industry == "hospitality" and any(k in skills for k in ("Food Safety", "ServSafe", "HACCP")):
            return "Strong food-safety background. Consider advancing toward sous chef or kitchen management roles."
        if industry == "healthcare" and "Patient Care" in skills:
            return "Solid patient care foundation. Ensure all clinical certifications are up to date on your resume."

        return base
