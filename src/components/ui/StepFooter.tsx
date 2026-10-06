// Bottom action row of a step card: Back on the left, primary action on the right
export default function StepFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
