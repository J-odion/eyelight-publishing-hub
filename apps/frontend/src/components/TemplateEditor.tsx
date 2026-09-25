import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Eye, X, Check } from 'lucide-react';
import { CrmApi } from '@/lib/api';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TemplateEditorProps {
  initialSubject?: string;
  initialBuilderData?: any; // We ignore this now since we dropped GrapesJS
  initialHtml?: string;
  onSave: (subject: string, html: string, builderData: any) => Promise<void>;
  onClose: () => void;
}

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

const DEFAULT_HTML = `
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://res.cloudinary.com/wl57snga/image/upload/v1727299000/eyelight-logo-placeholder.png" alt="Eyelight Publishers" style="max-width: 180px; height: auto;" />
  </div>
  <h1 style="text-align: center; font-size: 24px; color: #111; margin-bottom: 20px;">Welcome to Eyelight</h1>
  <p style="font-size: 16px; color: #444; line-height: 1.6;">Hi {{firstName}},</p>
  <p style="font-size: 16px; color: #444; line-height: 1.6;">Start writing your amazing content here. We have set up a clean, modern template for you to use. You can replace this image or add new ones using the toolbar above.</p>
  <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
    <a href="#" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Call to Action</a>
  </div>
`;

export default function TemplateEditor({
  initialSubject = '',
  initialHtml = DEFAULT_HTML,
  onSave,
  onClose
}: TemplateEditorProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [html, setHtml] = useState(initialHtml);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Wrap content in a clean email container
      const fullHtml = `
        <div style="font-family: Inter, sans-serif; max-w: 600px; margin: 0 auto; color: #111;">
          ${html}
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #888;">
            <p>You received this email because you are subscribed to Eyelight Publishing.</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #888; text-decoration: underline;">Unsubscribe here</a></p>
          </div>
        </div>
      `;
      await onSave(subject, fullHtml, null);
      toast.success('Template saved successfully!');
    } catch (err: any) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPreview = async () => {
    setIsSendingTest(true);
    try {
      const fullHtml = `
        <div style="font-family: Inter, sans-serif; max-w: 600px; margin: 0 auto; color: #111;">
          ${html}
        </div>
      `;
      await CrmApi.sendTestPreview({ subject: subject || 'Test Preview', html: fullHtml });
      toast.success('Test email sent successfully!');
    } catch (err: any) {
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans">
      {/* Sleek Header */}
      <header className="h-16 border-b border-[#eaeaea] flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex-1 max-w-xl flex items-center">
            <input 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              placeholder="Email Subject..."
              className="w-full text-lg font-medium border-none outline-none focus:ring-0 px-2 placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTestPreview} disabled={isSendingTest} className="border-[#eaeaea] shadow-sm text-sm h-9 px-4">
            {isSendingTest ? 'Sending...' : 'Send Test'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-black text-white hover:bg-[#222] shadow-sm text-sm h-9 px-4">
            {isSaving ? 'Saving...' : 'Save template'}
          </Button>
        </div>
      </header>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto bg-[#FAFAFA] flex justify-center py-10">
        <div className="w-[700px] bg-white border border-[#eaeaea] rounded-xl shadow-sm overflow-hidden flex flex-col h-fit min-h-[600px]">
          {/* Custom styles for ReactQuill to make it look like a seamless block editor */}
          <style dangerouslySetInnerHTML={{__html: `
            .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #eaeaea !important; padding: 12px 16px !important; background: #fff; }
            .ql-container.ql-snow { border: none !important; font-family: inherit !important; font-size: 15px !important; }
            .ql-editor { min-height: 500px; padding: 32px 40px !important; line-height: 1.6; color: #111; }
            .ql-editor p { margin-bottom: 1em; }
            .ql-editor h1 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; }
            .ql-editor h2 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; }
            .ql-editor a { color: #000; text-decoration: underline; }
          `}} />
          <ReactQuill 
            theme="snow"
            value={html}
            onChange={setHtml}
            modules={QUILL_MODULES}
            placeholder="Start writing your email... Use {{firstName}} for personalization."
            className="flex-1 flex flex-col"
          />
        </div>
      </div>
    </div>
  );
}
