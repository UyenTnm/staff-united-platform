export default function PaymentCard() {
  return (
    <div className="border rounded-xl p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Payment</h2>

      <div className="space-y-3">
        <p>
          <strong>Status:</strong> Awaiting Deposit
        </p>

        <p>
          <strong>Deposit:</strong> —
        </p>

        <p>
          <strong>Balance:</strong> —
        </p>
      </div>
    </div>
  );
}
