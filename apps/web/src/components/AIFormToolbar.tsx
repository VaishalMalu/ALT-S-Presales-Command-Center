import React, { useState } from "react";
import { Wand2, ShieldAlert, Lightbulb, Loader2, X } from "lucide-react";
import { generateJSON, generateText } from "../../lib/ai/groq";

interface AIFormToolbarProps {
  formType: string;
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
}

export default function AIFormToolbar({ formType, formData, setFormData }: AIFormToolbarProps) {
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [autofillText, setAutofillText] = useState("");
  const [isLoading, setIsLoading] = useState<"autofill" | "validate" | "recommend" | null>(null);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "warning" | "info" | "error", title: string, content: string } | null>(null);

  const handleAutofill = async () => {
    if (!autofillText.trim()) return;
    setIsLoading("autofill");
    setAiMessage(null);
    try {
      const prompt = `Extract the following unstructured text into a JSON object for a ${formType} form. 
Current form data structure: ${JSON.stringify(formData)}
Only include keys that exist in the current form data structure. Do not nest them under another key, return the flat object.

Unstructured text to extract:
${autofillText}`;

      const json = await generateJSON(prompt);
      
      // Update form data safely
      setFormData((prev: any) => ({
        ...prev,
        ...json
      }));

      setIsAutofillModalOpen(false);
      setAutofillText("");
      setAiMessage({
        type: "success",
        title: "Autofill Complete",
        content: "Form fields have been successfully populated from your text."
      });
    } catch (error: any) {
      setAiMessage({
        type: "error",
        title: "Autofill Failed",
        content: error.message || "Could not parse text."
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleValidate = async () => {
    setIsLoading("validate");
    setAiMessage(null);
    try {
      const prompt = `You are a strict data validator and risk analyzer for a ${formType} form in a Pre-Sales application.
Analyze the following form data for:
1. Missing critical information (e.g., missing deadlines, undefined values).
2. Unrealistic combinations (e.g., Stage is "Lead Created" but Probability is 100%).
3. Potential business risks (e.g., very high deal value but no competitors listed).

Form Data:
${JSON.stringify(formData, null, 2)}

Provide a concise, bulleted summary of risks and validation errors. If everything looks perfect, just say "No major risks detected."`;

      const analysis = await generateText(prompt);
      
      setAiMessage({
        type: analysis.toLowerCase().includes("no major risks") ? "success" : "warning",
        title: "Risk & Validation Analysis",
        content: analysis
      });
    } catch (error: any) {
      setAiMessage({
        type: "error",
        title: "Analysis Failed",
        content: error.message || "Could not analyze form."
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRecommend = async () => {
    setIsLoading("recommend");
    setAiMessage(null);
    try {
      const prompt = `You are an expert enterprise pre-sales advisor. Based on this ${formType} data, provide 2-3 highly tactical, actionable "Next Steps".

Form Data:
${JSON.stringify(formData, null, 2)}

Be extremely concise and direct. Keep it under 50 words.`;

      const recommendation = await generateText(prompt);
      
      // Attempt to auto-fill next steps if the field exists
      setFormData((prev: any) => ({
        ...prev,
        next_steps: prev.next_steps ? `${prev.next_steps}\n\nAI Suggestion: ${recommendation}` : recommendation
      }));

      setAiMessage({
        type: "info",
        title: "AI Recommendation Generated",
        content: "Next Steps have been updated based on AI suggestions."
      });
    } catch (error: any) {
      setAiMessage({
        type: "error",
        title: "Recommendation Failed",
        content: error.message || "Could not generate recommendations."
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
        <span className="text-sm font-semibold text-primary flex items-center gap-1.5 mr-2">
          <Wand2 className="w-4 h-4" />
          AI Tools
        </span>
        
        <button
          type="button"
          onClick={() => setIsAutofillModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors"
          disabled={isLoading !== null}
        >
          {isLoading === "autofill" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          Autofill from Text
        </button>

        <button
          type="button"
          onClick={handleValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors"
          disabled={isLoading !== null}
        >
          {isLoading === "validate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
          Analyze Risk
        </button>

        <button
          type="button"
          onClick={handleRecommend}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors"
          disabled={isLoading !== null}
        >
          {isLoading === "recommend" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5 text-blue-500" />}
          Recommend Next Steps
        </button>
      </div>

      {aiMessage && (
        <div className={`p-4 rounded-lg relative ${
          aiMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" :
          aiMessage.type === "warning" ? "bg-amber-50 text-amber-800 border border-amber-200" :
          aiMessage.type === "error" ? "bg-red-50 text-red-800 border border-red-200" :
          "bg-blue-50 text-blue-800 border border-blue-200"
        }`}>
          <button 
            type="button"
            onClick={() => setAiMessage(null)}
            className="absolute top-3 right-3 text-current opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
          <h4 className="font-semibold text-sm mb-1">{aiMessage.title}</h4>
          <p className="text-sm whitespace-pre-wrap">{aiMessage.content}</p>
        </div>
      )}

      {/* Autofill Modal */}
      {isAutofillModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                AI Autofill
              </h3>
              <button 
                type="button"
                onClick={() => setIsAutofillModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">
                Paste meeting notes, emails, or unstructured text here. The AI will extract the relevant entities and fill out the form for you.
              </p>
              <textarea
                value={autofillText}
                onChange={(e) => setAutofillText(e.target.value)}
                placeholder="E.g., We had a great call with Microsoft today. They are looking for a $50k Azure migration by next month. The probability is looking like 60%..."
                className="w-full h-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAutofillModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAutofill}
                disabled={isLoading === "autofill" || !autofillText.trim()}
                className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-[#1E2761] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading === "autofill" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Extract & Fill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
