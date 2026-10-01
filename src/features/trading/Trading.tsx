import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { AddButton, Card, PageHeader } from "../../components/UI";
import { EntryList } from "../../components/EntryList";
export default function Trading() {
  const { db } = useStore(),
    open = useEditor();
  return (
    <>
      <PageHeader
        eyebrow="PERFORMANCE / TRADING"
        title="Trade. Reflect. Improve."
        description="A clear record of your decisions and the lessons behind them."
        action={<AddButton onClick={() => open("trades")}>Add trade</AddButton>}
      />
      <div className="stat-grid three">
        <Card>
          <span className="stat-label">Trades recorded</span>
          <strong className="stat-value">{db.trades.length}</strong>
        </Card>
        <Card>
          <span className="stat-label">Open positions</span>
          <strong className="stat-value">
            {db.trades.filter((t) => t.exit === null).length}
          </strong>
        </Card>
        <Card>
          <span className="stat-label">Closed trades</span>
          <strong className="stat-value">
            {db.trades.filter((t) => t.exit !== null).length}
          </strong>
        </Card>
      </div>
      <div className="section-heading">
        <h2>Your journal</h2>
        <span className="muted tiny">Quantity-based P&L · fees included</span>
      </div>
      <EntryList kind="trades" entries={db.trades} />
    </>
  );
}
