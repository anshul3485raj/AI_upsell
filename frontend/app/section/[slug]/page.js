const sectionTitles = {
  recommendations: "Recommendations",
  "checkout-extension": "Checkout Extension",
  "customize-widgets": "Customize Widgets",
  "intelli-search-filter": "Intelli Search and Filter",
  "product-addons": "Product Addons",
  "cart-drawer": "Cart Drawer",
  "my-plan": "My Plan",
  "exclude-products": "Exclude Products",
  more: "More",
  "thankyou-page": "Thankyou Page",
  "home-page": "Home Page",
  "collection-pages": "Collection Pages",
  "search-results-page": "Search Results Page",
  "404-page": "404 Not Found Page",
  "blog-posts": "Blog Posts or Other Pages",
  "account-login": "Account/Login Page",
};

export default function SectionPage({ params }) {
  const title = sectionTitles[params.slug] || params.slug.replace(/-/g, " ");

  return (
    <div className="page-section">
      <div className="surface">
        <h1>{title}</h1>
        <p className="small">
          This section is coming soon. Use the left navigation to explore existing pages in the app.
        </p>
      </div>
    </div>
  );
}
