export default function ApprovalCard({ onDecide }) {
  return (
    <div>
      <p>This recommendation changes spend or the schedule.</p>
      <button type="button" onClick={() => onDecide(true)}>
        Approve
      </button>
      <button type="button" onClick={() => onDecide(false)}>
        Reject
      </button>
    </div>
  );
}
