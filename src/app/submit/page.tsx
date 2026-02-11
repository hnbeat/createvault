import { SubmitReferenceForm } from "@/components/forms/SubmitReferenceForm";

export default function SubmitPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>➕</span> Submit a Reference
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Share a useful link with your team
        </p>
      </div>

      <div className="rounded-2xl border border-bd bg-neutral-900 p-6 shadow-sm">
        <SubmitReferenceForm />
      </div>
    </div>
  );
}
