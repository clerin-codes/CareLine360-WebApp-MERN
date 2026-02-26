import PatientNavbar from "./components/PatientNavbar";
import AiExplainPanel from "./components/AiExplainPanel";

export default function AiChat() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fbff] to-white bg-[url('/')] bg-cover bg-center p-6">
      <PatientNavbar />

      {/* same width as navbar (max-w-6xl) */}
      <div className="max-w-6xl mx-auto px-5 py-6">
        <AiExplainPanel />
      </div>
    </div>
  );
}