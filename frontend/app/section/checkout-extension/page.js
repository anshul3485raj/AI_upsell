import Link from "next/link";

export default function CheckoutExtensionLanding() {
  return (
    <div className="page-section">
      <div className="surface">
        <div className="section-header">
          <div>
            <p className="overline">Checkout Extension</p>
            <h1>Checkout Extension</h1>
          </div>
        </div>
        <p className="small">
          Configure upsell flows that appear after checkout. Choose a page to manage offer rules, preview the experience, and activate your upsell.
        </p>
      </div>

      <div className="checkout-option-grid">
        <Link href="/section/checkout-extension/thankyou-page-upsell" className="checkout-option-card">
          <div>
            <strong>Thankyou Page Upsell</strong>
            <p>Show a targeted upsell after the order is placed with a clean thank you page layout.</p>
          </div>
          <div className="pill">Configure</div>
        </Link>

        <Link href="/section/checkout-extension/order-status-page-upsell" className="checkout-option-card">
          <div>
            <strong>Order Status Page Upsell</strong>
            <p>Display cross-sell and add-on offers on the final order status page.</p>
          </div>
          <div className="pill">Configure</div>
        </Link>
      </div>
    </div>
  );
}
