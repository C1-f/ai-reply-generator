import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Button, Input, Tag, Card, Empty, Spin, Tooltip } from "antd";
import {
  ReloadOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  SaveOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import api from "../api/axios";

const { TextArea } = Input;

const TONES = [
  { label: "高情商", value: "高情商", color: "#22c55e" },
  { label: "阴阳怪气", value: "阴阳怪气", color: "#f59e0b" },
  { label: "幽默", value: "幽默", color: "#3b82f6" },
  { label: "婉拒", value: "婉拒", color: "#8b5cf6" },
];

export interface LocalQuote {
  id: number;
  scene: string;
  tone: string;
  content: string;
  created_at: string;
}

const STORAGE_KEY = "ai_reply_quotes";

export function loadQuotes(): LocalQuote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuotes(quotes: LocalQuote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

export default function GeneratePage() {
  const [scene, setScene] = useState("");
  const [tone, setTone] = useState("高情商");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<LocalQuote[]>([]);
  const navigate = useNavigate();

  const loadRecent = () => {
    setRecentQuotes(loadQuotes().slice(0, 5));
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleGenerate = async () => {
    if (!scene.trim()) {
      message.warning("请先输入对方发来的话");
      return;
    }
    setLoading(true);
    setSuggestions([]);
    setSavedIndex(null);

    try {
      const res = await api.post("/api/generate", { scene, tone });
      setSuggestions(res.data.suggestions);
      message.success(`已为你生成 ${res.data.suggestions.length} 条回复`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      message.error(typeof detail === "string" ? detail : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败");
    }
  };

  const handleSave = (content: string, index: number) => {
    const quotes = loadQuotes();
    const newQuote: LocalQuote = {
      id: Date.now(),
      scene,
      tone,
      content,
      created_at: new Date().toISOString(),
    };
    quotes.unshift(newQuote);
    saveQuotes(quotes);
    setSavedIndex(index);
    message.success("已保存到我的语录");
    loadRecent();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <header
        style={{
          background: "#fff",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          ⚡ AI 高情商嘴替
        </h1>
        <div>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => navigate("/history")}
          >
            我的语录
          </Button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 32px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
          gap: 24,
        }}
      >
        <div>
          <Card
            title="📝 输入场景"
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <TextArea
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              placeholder={'把对方发来的话粘贴到这里……\n例如：老板说"年轻人要多吃苦，加班是福报"'}
              rows={6}
              style={{ fontSize: 15, resize: "none" }}
              maxLength={2000}
              showCount
            />

            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 12, fontWeight: 600, color: "#333" }}>
                选择语气
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TONES.map((t) => {
                  const active = tone === t.value;
                  return (
                    <Tag.CheckableTag
                      key={t.value}
                      checked={active}
                      onChange={() => setTone(t.value)}
                      style={{
                        padding: "6px 18px",
                        fontSize: 14,
                        borderRadius: 20,
                        border: active ? `1px solid ${t.color}` : "1px solid #ddd",
                        background: active ? t.color : "#fff",
                        color: active ? "#fff" : "#333",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {t.label}
                    </Tag.CheckableTag>
                  );
                })}
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              icon={<ThunderboltOutlined />}
              loading={loading}
              onClick={handleGenerate}
              style={{
                marginTop: 24,
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: 10,
              }}
            >
              {loading ? "AI 正在思考中……" : "生成回复"}
            </Button>
          </Card>

          {recentQuotes.length > 0 && (
            <Card
              title="🕐 最近语录"
              style={{
                marginTop: 16,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              size="small"
            >
              {recentQuotes.map((q) => (
                <div
                  key={q.id}
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: 13,
                    color: "#555",
                  }}
                >
                  <Tag color="blue" style={{ marginRight: 6, fontSize: 11 }}>
                    {q.tone}
                  </Tag>
                  <span style={{ color: "#999" }}>
                    {q.content.length > 40 ? q.content.slice(0, 40) + "…" : q.content}
                  </span>
                </div>
              ))}
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/history")}
                style={{ marginTop: 8, padding: 0 }}
              >
                查看全部 →
              </Button>
            </Card>
          )}
        </div>

        <div>
          <Card
            title="💬 生成的回复"
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              minHeight: 500,
            }}
          >
            {loading && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Spin size="large" />
                <p style={{ marginTop: 20, color: "#999" }}>
                  AI 正在为你思考……
                </p>
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <Empty
                description="输入场景后点击「生成回复」"
                style={{ marginTop: 100 }}
              />
            )}

            {!loading &&
              suggestions.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fafbff",
                    borderRadius: 10,
                    padding: 18,
                    marginBottom: 14,
                    borderLeft: "4px solid #667eea",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>
                      建议 {i + 1}
                    </span>
                    <div>
                      <Tooltip title="复制">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopy(s)}
                        />
                      </Tooltip>
                      <Tooltip title={savedIndex === i ? "已保存" : "保存到语录"}>
                        <Button
                          type="text"
                          size="small"
                          icon={
                            savedIndex === i ? (
                              <CheckOutlined style={{ color: "#22c55e" }} />
                            ) : (
                              <SaveOutlined />
                            )
                          }
                          disabled={savedIndex === i}
                          onClick={() => handleSave(s, i)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#222",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {s}
                  </p>
                </div>
              ))}

            {!loading && suggestions.length > 0 && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleGenerate}
                style={{ marginTop: 8 }}
                block
              >
                换一批
              </Button>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}