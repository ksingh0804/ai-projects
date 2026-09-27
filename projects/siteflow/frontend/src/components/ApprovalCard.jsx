import { useState } from "react";

export default function ApprovalCard({ recommendation, disabled, onDecide }) {
  const [note, setNote] = useState("");
  return (
    <section className="approval">
      <p className="eyebrow">Approval needed</p>
      <h2>This recommendation changes a buy or the schedule</h2>
      <p>{recommendation}</p>
      <label>
        Note
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          placeholder="Optional note for the job file"
        />
      </label>
      <div className="row">
        <button type="button" disabled={disabled} onClick={() => onDecide(true, note)}>
          Approve
        </button>
        <button type="button" className="secondary" disabled={disabled} onClick={() => onDecide(false, note)}>
          Reject
        </button>
      </div>
      <p className="fine">
        Approving records your decision. SiteFlow does not place the order or edit the schedule.
      </p>
    </section>
  );
}
