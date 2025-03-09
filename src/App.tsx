import { Content } from "@tiptap/core";
import { useState } from "react";
import { MinimalTiptapEditor } from "./components/minimal-tiptap";

export const App = () => {
  const [value, setValue] = useState<Content>("");

  return (
    <MinimalTiptapEditor
      value={value}
      onChange={setValue}
      className="w-full"
      editorContentClassName="p-5"
      output="html"
      placeholder="Enter your description..."
      autofocus={true}
      editable={true}
      editorClassName="focus:outline-none"
    />
  );
};
