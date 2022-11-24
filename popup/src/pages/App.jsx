import { useEffect } from "react";
import "./style.scss";
import { Form, Input, Button } from "antd";
import { IS_PROD } from "@/constant.js";

export default function App() {
  const [form] = Form.useForm();

  useEffect(() => {
    IS_PROD &&
      chrome.storage.local.get("config", (data) => {
        form.setFieldsValue(
          data.config || { selector: 'input[type="password"]' }
        );
      });
  }, []);

  const onSave = () => {
    if (IS_PROD) {
      const config = form.getFieldsValue();
      chrome.storage.local.set({ config }, () => {
        chrome.tabs.query({ url: `*://${config.domain}/*` }, function (tabs) {
          tabs.forEach((item) => {
            chrome.tabs.sendMessage(item.id, { type: "fillPassword" });
          });
        });
      });
    }
  };

  return (
    <div className="popup-container">
      <Form form={form} style={{ textAlign: "center" }} labelCol={{ span: 4 }}>
        <Form.Item label="网站URL" name="domain">
          <Input />
        </Form.Item>
        <Form.Item label="填充密码" name="password">
          <Input />
        </Form.Item>
        <Form.Item label="选择器" name="selector">
          <Input placeholder='默认为，input[type="password"]，需要符合querySelector的选择器语法' />
        </Form.Item>
        <Button size="small" type="primary" onClick={onSave}>
          保存
        </Button>
      </Form>
    </div>
  );
}
