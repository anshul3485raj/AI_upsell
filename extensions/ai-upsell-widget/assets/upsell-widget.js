(function () {
  var WIDGET_SELECTOR = ".ai-upsell-widget";
  var DEFAULT_TITLE = "You may also like";

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function requestJson(url, options) {
    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }
      return response.json();
    });
  }

  function postAnalytics(backendUrl, route, payload) {
    return fetch(backendUrl + "/analytics/" + route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      return null;
    });
  }

  function buildRecommendationsUrl(container, productIds) {
    var backendUrl = container.dataset.backendUrl;
    var shop = container.dataset.shop;
    var endpoint = new URL(backendUrl + "/upsell");
    endpoint.searchParams.set("shop", shop);

    if (container.dataset.upsellContext === "product") {
      endpoint.searchParams.set("productId", container.dataset.productId || "");
      return endpoint.toString();
    }

    if (productIds.length > 0) {
      endpoint.searchParams.set("cartProductIds", productIds.join(","));
    }
    return endpoint.toString();
  }

  function parseCartProductIds(container) {
    var preset = container.dataset.cartProductIds || "";
    if (preset.trim().length > 0) {
      return Promise.resolve(
        preset
          .split(",")
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean),
      );
    }

    return requestJson("/cart.js", { method: "GET" }).then(function (cart) {
      return (cart.items || []).map(function (item) {
        return String(item.product_id);
      });
    });
  }

  function renderRecommendations(container, payload) {
    var recommendations = payload.recommendations || [];
    if (recommendations.length === 0) {
      container.innerHTML = "";
      return;
    }

    var heading = escapeHtml(container.dataset.title || DEFAULT_TITLE);
    var html =
      '<div class="ai-upsell-inner">' +
      '<h3 class="ai-upsell-title">' +
      heading +
      "</h3>" +
      '<div class="ai-upsell-grid">';

    recommendations.forEach(function (item) {
      var price = Number(item.price || 0).toFixed(2);
      var currency = item.currencyCode || "";
      var discountText =
        item.discount && item.discount.type !== "NONE"
          ? '<div class="ai-upsell-discount">' +
            escapeHtml(item.discount.type === "PERCENTAGE" ? item.discount.value + "% off" : currency + " " + item.discount.value + " off") +
            "</div>"
          : "";

      html +=
        '<article class="ai-upsell-card" data-recommended-product-id="' +
        escapeHtml(item.id) +
        '" data-rule-id="' +
        escapeHtml(item.ruleId || "") +
        '" data-variant-id="' +
        escapeHtml(item.variantLegacyId || "") +
        '">' +
        (item.imageUrl
          ? '<img class="ai-upsell-image" src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />'
          : "") +
        '<div class="ai-upsell-body">' +
        '<h4 class="ai-upsell-item-title">' +
        escapeHtml(item.title) +
        "</h4>" +
        '<div class="ai-upsell-price">' +
        escapeHtml(currency + " " + price) +
        "</div>" +
        discountText +
        '<button class="ai-upsell-add-btn" type="button">Add to cart</button>' +
        "</div>" +
        "</article>";
    });

    html += "</div></div>";
    container.innerHTML = html;
  }

  function bindConversionTracking(container, payload) {
    var shop = container.dataset.shop;
    var backendUrl = container.dataset.backendUrl;
    var sourceProductId = payload.sourceProductId;

    container.querySelectorAll(".ai-upsell-add-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var card = button.closest(".ai-upsell-card");
        var recommendedProductId = card ? card.getAttribute("data-recommended-product-id") : "";
        var ruleId = card ? card.getAttribute("data-rule-id") : "";
        var variantId = card ? card.getAttribute("data-variant-id") : "";

        if (!recommendedProductId || !variantId) {
          return;
        }

        postAnalytics(backendUrl, "conversion", {
          shop: shop,
          ruleId: ruleId || undefined,
          sourceProductId: sourceProductId || undefined,
          recommendedProductId: recommendedProductId,
          meta: {
            context: container.dataset.upsellContext || "unknown",
          },
        });

        fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            items: [{ id: Number(variantId), quantity: 1 }],
          }),
        })
          .then(function () {
            window.location.href = "/cart";
          })
          .catch(function () {
            window.location.href = "/cart";
          });
      });
    });
  }

  function trackImpressions(container, payload) {
    var shop = container.dataset.shop;
    var backendUrl = container.dataset.backendUrl;
    var sourceProductId = payload.sourceProductId;
    var recommendations = payload.recommendations || [];

    recommendations.forEach(function (item) {
      postAnalytics(backendUrl, "impression", {
        shop: shop,
        ruleId: item.ruleId || undefined,
        sourceProductId: sourceProductId || undefined,
        recommendedProductId: item.id,
        meta: {
          context: container.dataset.upsellContext || "unknown",
        },
      });
    });
  }

  function initWidget(container) {
    var backendUrl = container.dataset.backendUrl;
    var shop = container.dataset.shop;
    if (!backendUrl || !shop) {
      return;
    }

    parseCartProductIds(container)
      .then(function (productIds) {
        var url = buildRecommendationsUrl(container, productIds);
        return requestJson(url, { method: "GET" });
      })
      .then(function (payload) {
        renderRecommendations(container, payload);
        trackImpressions(container, payload);
        bindConversionTracking(container, payload);
      })
      .catch(function () {
        container.innerHTML = "";
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(WIDGET_SELECTOR).forEach(initWidget);
  });
})();
