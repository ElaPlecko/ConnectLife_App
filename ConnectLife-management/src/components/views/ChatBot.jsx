import { useState, useEffect, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { clearRemoteConfigTemplateCache } from "../../services/updateRemoteConfig";

const chatAssistant = httpsCallable(functions, "chatAssistant");

export default function ChatBot({
  availableMarkets = [],
  availableFeatures = [],
  featureData = {},
  onExecuteAction,
  onClose,
  userEmail,
}) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hello! 👋 I help you manage features by markets.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[-_/]/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findMatch(text, options) {
    const lower = text.toLowerCase();
    const exact = options.find((o) => lower.includes(o.toLowerCase()));
    if (exact) return exact;

    const normalizedText = normalizeText(text);
    const textWords = new Set(
      normalizedText
        .split(" ")
        .filter((word) => word.length >= 3)
    );

    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionWords = normalizeText(option)
        .split(" ")
        .filter((word) => word.length >= 3);

      const score = optionWords.reduce(
        (count, word) => count + (textWords.has(word) ? 1 : 0),
        0
      );

      if (score > bestScore) {
        bestScore = score;
        bestMatch = option;
      }
    }

    if (bestScore > 0) return bestMatch;

    return (
      options.find((o) =>
        o.length >= 4 && lower.includes(o.slice(0, 4).toLowerCase())
      ) || null
    );
  }

  function parseMessage(message) {
    const lower = message.toLowerCase();

    if (lower.includes("show") || lower.includes("list") || lower.includes("pokaz")) {
      let market = findMatch(message, availableMarkets);

      if (
        lower.includes("default") ||
        lower.includes("all markets") ||
        lower.includes("global") ||
        lower.includes("for all") ||
        lower.includes("za vse") ||
        lower.includes("privzeto") ||
        lower.includes("default market")
      ) {
        market = "Default value";
      }
      return market
        ? { type: "query", market }
        : { type: "unknown" };
    }

    const action =
      lower.includes("disable") || lower.includes("izklopite") || lower.includes("izklopi")
        ? "disable"
        : lower.includes("enable") || lower.includes("vklopite") || lower.includes("vklopi")
        ? "enable"
        : null;

    if (!action) return { type: "unknown" };

    const market = findMatch(message, availableMarkets);
    
    const feature = findMatch(message, availableFeatures);

    if (!market && !feature)
      return { type: "missing", missing: "market and feature" };
    if (!market) return { type: "missing", missing: "market", feature };
    if (!feature) return { type: "missing", missing: "feature", market };

    const applianceId = Object.keys(featureData).find((id) =>
      featureData[id]?.[feature] !== undefined
    );

    return {
      type: "action",
      action,
      market,
      feature,
      applianceId: applianceId || null,
      value: action === "enable",
    };
  }

  function buildQueryResponse(market) {
    const lines = [];
    Object.entries(featureData).forEach(([applianceId, features]) => {
      const active = Object.entries(features)
        .filter(([, markets]) => markets?.[market] === true)
        .map(([f]) => f);
      const inactive = Object.entries(features)
        .filter(([, markets]) => markets?.[market] === false)
        .map(([f]) => f);
      if (active.length || inactive.length) {
        lines.push(`📱 ${applianceId}`);
        if (active.length) lines.push(`  ✅ Enabled: ${active.join(", ")}`);
        if (inactive.length) lines.push(`  ❌ Disabled: ${inactive.join(", ")}`);
      }
    });
    return lines.length
      ? `Feature status for **${market}**:\n\n${lines.join("\n")}`
      : `No feature data found for market "${market}".`;
  }

  function handleSend() {
  const text = input.trim();
  if (!text || loading) return;

  setMessages((prev) => [...prev, { role: "user", text }]);
  setInput("");
  setLoading(true);

  setTimeout(async () => {
    try {
      const result = await chatAssistant({
        message: text,
        markets: availableMarkets,
        features: availableFeatures,
      });

      console.log("AI RESPONSE:", result.data);

      const parsed = parseMessage(text);

      if (parsed.type === "query") {
        const response = buildQueryResponse(parsed.market);
        setMessages((prev) => [...prev, { role: "bot", text: response }]);

      } else if (parsed.type === "action") {
        // Always execute action, even if local featureData state may be stale.
        setLoading(true);
        try {
          await onExecuteAction({
            ...parsed,
            fromChatBot: true,
          });

          clearRemoteConfigTemplateCache();
          window.dispatchEvent(new Event("connectlifeRemoteConfigUpdated"));
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: `✅ Feature **${parsed.feature}** was successfully ${parsed.action === "disable" ? "disabled" : "enabled"} for market **${parsed.market}**.`,
            },
          ]);
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: `❌ Error: ${err.message}`,
            },
          ]);
        } finally {
          setLoading(false);
        }

      } else if (parsed.type === "missing") {
        const hints = {
          "market and feature": `Please specify a market (e.g. ${availableMarkets
            .slice(0, 3)
            .join(", ")}) and a feature (e.g. ${availableFeatures
            .slice(0, 3)
            .join(", ")}).`,
          market: `Which market? Available: ${availableMarkets.join(", ")}.`,
          feature: `Which feature? Available: ${availableFeatures.join(", ")}.`,
        };

        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `I didn't understand the request. ${
              hints[parsed.missing] || "Please try again."
            }`,
          },
        ]);

      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `I didn't understand. Try:\n• "Disable [feature] for [appliance] in [market]"\n• "Enable [feature] in [market]"\n• "Show all features for [market]"`,
          },
        ]);
      }
    } catch (err) {
      console.error("CHATBOT ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, 400);
}

  async function confirmAction() {
    if (!pendingAction) return;
    setLoading(true);
    try {
      await onExecuteAction(pendingAction);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `✅ Feature **${pendingAction.feature}** was successfully ${pendingAction.action === "disable" ? "disabled" : "enabled"} for market **${pendingAction.market}**.`,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `❌ Error: ${err.message}` },
      ]);
    } finally {
      setPendingAction(null);
      setLoading(false);
    }
  }

  function cancelAction() {
    setPendingAction(null);
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "Understood, action was cancelled." },
    ]);
  }

  function formatText(text) {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        <br />
      </span>
    ));
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <span>🤖 ConnectLife Assistant</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: "0 4px",
            }}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            {formatText(msg.text)}
          </div>
        ))}
        {loading && (
          <div className="msg bot" style={{ opacity: 0.6 }}>
            <em>Thinking...</em>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Confirm / Cancel buttons - No longer needed with auto-execute */}
      {/* {pendingAction && (
        <div className="chat-confirm">
          <button className="confirm-yes" onClick={confirmAction} disabled={loading}>
            ✅ Yes, execute
          </button>
          <button className="confirm-no" onClick={cancelAction} disabled={loading}>
            ❌ No, cancel
          </button>
        </div>
      )} */}

      {/* Input */}
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Disable recipes for oven in US…"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}