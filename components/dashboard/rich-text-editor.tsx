"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { z } from "zod";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";
import { uploadMedia } from "@/app/dashboard/media/actions";

type RichTextEditorProps = {
  name: string; // hidden input field name, "content"
  defaultValue?: string; // existing HTML in edit mode
  // Additive to the spec's prop shape: lets post-form.tsx's dirty-tracking
  // observe edits, since the hidden input's value changing doesn't fire a
  // React onChange the same way a textarea's would.
  onChangeHtml?: (html: string) => void;
};

const httpUrlSchema = z.url({ protocol: /^https?$/ });

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

function ToolbarDivider() {
  return <div className="mx-4 h-20 w-px shrink-0 bg-neutral-10" aria-hidden="true" />;
}

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

function ToolbarButton({ label, onClick, active, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      className={`flex h-32 w-32 shrink-0 items-center justify-center text-neutral-4 transition-colors duration-200 hover:bg-surface-1 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-4 ${
        active ? "bg-surface-1 text-primary" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  name,
  defaultValue = "",
  onChangeHtml,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const surfaceId = useId();
  const [html, setHtml] = useState(defaultValue);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // MANDATORY for Next SSR
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }, // h1 is the post title; body content starts at h2
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-8" },
      }),
      Placeholder.configure({ placeholder: "Write the article…" }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      setHtml(next);
      onChangeHtml?.(next);
    },
  });

  // Destroy on unmount to avoid leaks.
  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Link URL", previous ?? "https://");

    if (input === null) return; // cancelled

    if (input.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const result = httpUrlSchema.safeParse(input.trim());
    if (!result.success) {
      window.alert("Enter a valid http(s) URL.");
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: result.data }).run();
  }, [editor]);

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  function handleImageButtonClick() {
    fileInputRef.current?.click();
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setImageError(null);
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMedia(formData);

    setIsUploadingImage(false);

    if (!result.ok) {
      setImageError(result.error);
      return;
    }

    const alt =
      window.prompt("Alt text for this image (leave empty if purely decorative)", "") ?? "";
    editor.chain().focus().setImage({ src: result.media.url, alt }).run();
  }

  if (!editor) {
    return <div className="min-h-400 rounded-8 border border-neutral-10 bg-white" />;
  }

  return (
    <div className="rounded-8 border border-neutral-10 bg-white">
      <div
        role="toolbar"
        aria-label="Formatting"
        aria-controls={surfaceId}
        className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-t-8 border-b border-neutral-10 bg-surface-2 p-8"
      >
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={16} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={unsetLink}
        >
          <Link2Off size={16} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Insert image"
          disabled={isUploadingImage}
          onClick={handleImageButtonClick}
        >
          <ImagePlus size={16} strokeWidth={1.5} />
        </ToolbarButton>
        {isUploadingImage && (
          <span className="text-p4 text-neutral-5">Uploading…</span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleImageSelected}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Undo"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={16} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={16} strokeWidth={1.5} />
        </ToolbarButton>
      </div>

      {imageError && (
        <p role="alert" className="border-b border-neutral-10 bg-white px-16 py-8 text-p4 text-error">
          {imageError}
        </p>
      )}

      <div id={surfaceId}>
        <EditorContent editor={editor} />
      </div>

      <input type="hidden" name={name} value={html} />
    </div>
  );
}
