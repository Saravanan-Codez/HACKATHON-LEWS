export const debugCollectorSource = `(() => {
  const send = (entry) => {
    try {
      fetch("/__manus__/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consoleLogs: [entry] }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // Debug collection must never interfere with the application.
    }
  };

  const originalError = console.error.bind(console);
  console.error = (...args) => {
    originalError(...args);
    send({ timestamp: Date.now(), level: "ERROR", args: args.map(String) });
  };

  window.addEventListener("error", (event) => {
    send({ timestamp: Date.now(), level: "ERROR", args: [event.message, event.filename, event.lineno] });
  });

  window.addEventListener("unhandledrejection", (event) => {
    send({ timestamp: Date.now(), level: "ERROR", args: ["Unhandled promise rejection", String(event.reason)] });
  });
})();`;
