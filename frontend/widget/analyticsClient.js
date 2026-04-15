export async function postWidgetEvent(backendBase, route, payload) {
  await fetch(`${backendBase}/analytics/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
