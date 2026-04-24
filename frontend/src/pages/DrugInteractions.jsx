import InteractionChecker from '../components/Interactions/InteractionChecker'

export default function DrugInteractions() {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Drug Interaction Checker</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Check if your current medications can safely be taken together
        </p>
      </div>
      <InteractionChecker />
    </div>
  )
}
