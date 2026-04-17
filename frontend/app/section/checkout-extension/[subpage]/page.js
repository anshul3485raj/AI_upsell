import Link from "next/link";

const pageConfig = {
  "thankyou-page-upsell": {
    label: "Thankyou Page Upsell",
    description: "Create a thank-you page upsell that appears after the order completes.",
    previewTitle: "Thanks for your purchase!",
    previewSubtitle: "Add one last high-converting offer before the customer leaves.",
    actionLabel: "Add to order",
    badge: "Thankyou page",
  },
  "order-status-page-upsell": {
    label: "Order Status Page Upsell",
    description: "Configure the order status page upsell experience and preview the layout.",
    previewTitle: "Order page preview",
    previewSubtitle: "This is how the upsell appears on the order status page.",
    actionLabel: "Add",
    badge: "Order status page",
  },
};

const recommendationOptions = [
  { label: "AI Based Recommendations", widget: "10001", checked: false },
  { label: "Top Selling Products", widget: "10002", checked: false },
  { label: "Related Products", widget: "10003", checked: false },
  { label: "Manual Recommendations", widget: "10004", checked: true },
  { label: "New Arrivals Products", widget: "10005", checked: false },
  { label: "Trending Products", widget: "10006", checked: false },
  { label: "Fixed Product Selection", widget: "10007", checked: false },
  { label: "Featured Collection", widget: "10008", checked: false },
];

export default function CheckoutExtensionSubpage({ params }) {
  const page = pageConfig[params.subpage];
  const isOrderStatus = params.subpage === "order-status-page-upsell";

  if (!page) {
    return (
      <div className="page-section">
        <div className="surface">
          <h1>Page not found</h1>
          <p className="small">This checkout extension page could not be found.</p>
          <Link href="/section/checkout-extension" className="button-link secondary">
            Back to Checkout Extension
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="surface">
        <div className="section-header">
          <div>
            <p className="overline">Checkout Extension</p>
            <h1>{page.label}</h1>
          </div>
          <Link href="/section/checkout-extension" className="button-link secondary">
            Back to overview
          </Link>
        </div>
        <p className="small">{page.description}</p>
      </div>

      <div className="checkout-page-grid">
        <div className="settings-panel">
          <div className="section-header">
            <div>
              <p className="overline">Page configuration</p>
              <h2>{isOrderStatus ? "Order Status Page settings" : "Upsell configuration"}</h2>
            </div>
          </div>

          {isOrderStatus ? (
            <div className="order-status-panel">
              <section className="order-status-panel-section">
                <div className="order-status-section-title">Choose Recommendations Type</div>
                <div className="order-status-checkbox-list">
                  {recommendationOptions.map((option) => (
                    <label key={option.widget} className="checkbox-row">
                      <span>
                        <input type="checkbox" defaultChecked={option.checked} /> {option.label}
                      </span>
                      <span className="widget-id">Widget ID: {option.widget}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="order-status-panel-section">
                <div className="order-status-section-title">Products To Show</div>
                <label>
                  <strong>Product count</strong>
                  <select className="select" defaultValue="3 items">
                    <option>2 items</option>
                    <option>3 items</option>
                    <option>4 items</option>
                  </select>
                </label>
                <label>
                  <strong>Featured product</strong>
                  <input className="input" defaultValue="Gift Card" />
                </label>
              </section>

              <section className="order-status-panel-section">
                <div className="order-status-section-title">Heading</div>
                <label>
                  <strong>Upsell headline</strong>
                  <input className="input" defaultValue="Order Page Upsell" />
                </label>
              </section>

              <section className="order-status-panel-section">
                <div className="order-status-section-title">Product Details</div>
                <label className="checkbox-row">
                  <span>Show product description</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="checkbox-row">
                  <span>Show product image</span>
                  <input type="checkbox" defaultChecked />
                </label>
              </section>

              <section className="order-status-panel-section">
                <div className="order-status-section-title">Add To Cart Button</div>
                <label>
                  <strong>Button label</strong>
                  <input className="input" defaultValue="Add" />
                </label>
                <label>
                  <strong>Button style</strong>
                  <select className="select" defaultValue="Primary">
                    <option>Primary</option>
                    <option>Secondary</option>
                  </select>
                </label>
              </section>

              <section className="order-status-panel-section">
                <div className="order-status-section-title">Order settings</div>
                <label className="checkbox-row">
                  <span>Show only after payment</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="checkbox-row">
                  <span>Enable upsell analytics</span>
                  <input type="checkbox" defaultChecked />
                </label>
              </section>

              <div className="checkout-controls">
                <div>
                  <strong>Active</strong>
                  <p className="small">Enable this upsell so it appears on the order status page.</p>
                </div>
                <button className="btn">Save settings</button>
              </div>
            </div>
          ) : (
            <div className="checkout-settings-group">
              <label>
                <strong>Offer title</strong>
                <input className="input" defaultValue="Complete your order with premium socks" />
              </label>
              <label>
                <strong>Offer description</strong>
                <textarea className="textarea" defaultValue="Add a complementary product to your order before it ships." rows={4} />
              </label>
              <label>
                <strong>Offer placement</strong>
                <select className="select" defaultValue={page.badge}>
                  <option>{page.badge}</option>
                  <option>Payment confirmation</option>
                  <option>Post-purchase sidebar</option>
                </select>
              </label>
              <div className="checkout-controls">
                <div>
                  <strong>Active</strong>
                  <p className="small">Enable this upsell so it appears on the selected checkout page.</p>
                </div>
                <button className="btn">Save settings</button>
              </div>
            </div>
          )}
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <div>
              <span className="pill">Live preview</span>
              <h2>{page.previewTitle}</h2>
              <p className="small">{page.previewSubtitle}</p>
            </div>
          </div>

          {isOrderStatus ? (
            <div className="order-status-preview-shell">
              <div className="order-status-preview-card">
                <div className="order-status-preview-title">
                  <div>
                    <h3>Order Page Upsell</h3>
                    <p className="small">Customers can add this offer directly from the order status page.</p>
                  </div>
                  <span className="preview-badge">{page.badge}</span>
                </div>

                <div className="order-status-item-card">
                  <div className="order-status-item-thumbnail">🎁</div>
                  <div>
                    <strong>Gift Card</strong>
                    <p className="small">$10.00</p>
                  </div>
                  <button className="btn">{page.actionLabel}</button>
                </div>

                <div className="order-status-footer">
                  Wiser © 2026 Powered by Expert Village Media Technologies
                </div>
              </div>
            </div>
          ) : (
            <div className="checkout-preview-shell">
              <div className="checkout-preview-banner">
                <div>
                  <strong>✅ Order placed</strong>
                  <p>Thank you! Your order is being processed.</p>
                </div>
                <div className="preview-badge">{page.badge}</div>
              </div>

              <div className="preview-offer-card">
                <div className="preview-offer-header">
                  <div>
                    <span className="pill">Recommended</span>
                    <h3>Premium Travel Mug</h3>
                  </div>
                  <span className="preview-price">$19.99</span>
                </div>
                <p className="small">Keep drinks hot on the go with a spill-proof insulated mug.</p>
                <div className="preview-offer-actions">
                  <button className="btn">{page.actionLabel}</button>
                  <button className="button-link">Learn more</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
