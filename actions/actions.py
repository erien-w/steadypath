from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionResumeSummary(Action):

    def name(self) -> Text:
        return "action_resume_summary"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        metadata = tracker.latest_message.get("metadata", {}) or {}
        resume_text = metadata.get("resume_text", "")
        extracted_skills = metadata.get("extracted_skills", "")

        if not resume_text:
            dispatcher.utter_message(text="I couldn't read your resume data. Please upload a plain text resume and try again.")
            return []

        skills = extracted_skills or self.extract_skills(resume_text)
        plan = self.build_recommendation(skills)

        dispatcher.utter_message(text="I scanned your resume successfully.")
        dispatcher.utter_message(text=f"The top skills I found are: {skills}.")
        dispatcher.utter_message(text=plan)
        return []

    def extract_skills(self, text: Text) -> Text:
        keywords = ['React', 'TypeScript', 'JavaScript', 'Python', 'Node', 'HTML', 'CSS', 'Figma', 'UI/UX', 'SQL', 'Leadership']
        found = [keyword for keyword in keywords if keyword.lower() in text.lower()]
        return ", ".join(found) if found else "No clear skills found"

    def build_recommendation(self, skills: Text) -> Text:
        if 'React' in skills and 'TypeScript' in skills:
            return "Great! Focus next on practical React projects and TypeScript architecture to level up your portfolio."
        if 'UI/UX' in skills:
            return "Try pairing design work with frontend implementation to strengthen your product skills."
        if 'Python' in skills:
            return "Consider adding a backend or data project so your profile feels more complete."
        return "I recommend focusing on one strong skill area and building a project to show it off."
