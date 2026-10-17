import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Empty, message, Popconfirm, Tag } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { loadQuotes, saveQuotes } from "./GeneratePage";

interface LocalQuote {
  id: number;
  scene: string;
  tone: string;
  content: string;
  created_at: string;
}

export default function HistoryPage() {
  const [quotes, setQuotes] = useState<LocalQuote[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setQuotes(loadQuotes());
  }, []);

  const handleDelete = (id: number) => {
    const next = quotes.filter((q) => q.id !== id);
    setQuotes(next);
    saveQuotes(next);
    message.success("已删除");
  };

  const handleClearAll = () => {
    setQuotes([]);
    saveQuotes([]);
    message.success("已清空");
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
          📚 我的语录
        </h1>
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/generate")}
            style={{ marginRight: 8 }}
          >
            返回生成
          </Button>
          {quotes.length > 0 && (
            <Popconfirm
              title="确定清空所有语录吗？"
              onConfirm={handleClearAll}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                清空
              </Button>
            </Popconfirm>
          )}
        </div>
      </header>

      <main
        style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}
      >
        {quotes.length === 0 && (
          <Empty description="还没有保存任何语录" style={{ marginTop: 100 }}>
            <Button
              type="primary"
              onClick={() => navigate("/generate")}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              去生成第一条
            </Button>
          </Empty>
        )}

        {quotes.map((q) => (
          <Card
            key={q.id}
            style={{
              marginBottom: 14,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            size="small"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div>
                <Tag color="blue" style={{ marginRight: 8 }}>
                  {q.tone}
                </Tag>
                <span style={{ fontSize: 12, color: "#aaa" }}>
                  {new Date(q.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <Popconfirm
                title="确定删除这条语录吗？"
                onConfirm={() => handleDelete(q.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>

            <p
              style={{
                fontSize: 13,
                color: "#888",
                margin: "0 0 10px",
                lineHeight: 1.6,
              }}
            >
              <strong>场景：</strong>
              {q.scene.length > 60 ? q.scene.slice(0, 60) + "…" : q.scene}
            </p>

            <p
              style={{
                fontSize: 15,
                color: "#222",
                lineHeight: 1.8,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {q.content}
            </p>
          </Card>
        ))}
      </main>
    </div>
  );
}