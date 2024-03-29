"""Debug Views to check the layout of emails"""

from django.views.generic.base import TemplateView


class DebugBaseView(TemplateView):
    """Debug View to check the layout of emails"""

    def get_context_data(self, **kwargs):
        """Generates sample datas to have a valid debug email"""

        context = super().get_context_data(**kwargs)
        context["title"] = "Development email preview"

        return context


class DebugViewHtml(DebugBaseView):
    """Debug View for HTML Email Layout"""

    template_name = "mail/html/invitation.html"


class DebugViewTxt(DebugBaseView):
    """Debug View for Text Email Layout"""

    template_name = "mail/text/invitation.txt"
