import React, { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Monitor, Smartphone, LayoutTemplate, Code } from 'lucide-react';
import { CrmApi } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface TemplateEditorProps {
  initialSubject?: string;
  initialBuilderData?: any; // the JSON representation from GrapesJS
  initialHtml?: string;
  onSave: (subject: string, html: string, builderData: any) => Promise<void>;
  onClose: () => void;
}

export default function TemplateEditor({
  initialSubject = '',
  initialBuilderData = null,
  initialHtml = '',
  onSave,
  onClose
}: TemplateEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [subject, setSubject] = useState(initialSubject);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importHtml, setImportHtml] = useState('');

  useEffect(() => {
    if (!editorRef.current) return;

    const e = grapesjs.init({
      container: editorRef.current,
      fromElement: false,
      height: '100%',
      width: '100%',
      storageManager: false, // We handle storage manually
      plugins: [gjsPresetNewsletter],
      pluginsOpts: {
        [gjsPresetNewsletter as any]: {
          modalTitleImport: 'Import template',
        },
      },
    });

    // Add merge tags block
    e.BlockManager.add('merge-tags', {
      label: 'Merge Tag',
      content: '<span data-gjs-type="text"> {{firstName}} </span>',
      category: 'Basic',
      attributes: { class: 'fa fa-tag' }
    });

    // Custom block for footer (locked unsubscribe)
    e.BlockManager.add('footer-unsubscribe', {
      label: 'Footer',
      content: `
        <table width="100%" style="margin-top:20px; border-top: 1px solid #eee; padding-top:20px; font-family: sans-serif; font-size: 12px; color: #888; text-align: center;">
          <tr>
            <td>
              <p>You received this email because you are subscribed to Eyelight Publishing.</p>
              <p><a href="{{unsubscribeUrl}}" style="color: #888; text-decoration: underline;">Unsubscribe here</a></p>
            </td>
          </tr>
        </table>
      `,
      category: 'Basic',
      attributes: { class: 'fa fa-file-text-o' }
    });

    // Load initial data
    if (initialBuilderData && Object.keys(initialBuilderData).length > 0) {
      e.loadProjectData(initialBuilderData);
    } else if (initialHtml) {
      e.setComponents(initialHtml);
    } else {
      // Default initial layout
      e.setComponents(`
        <table width="100%" style="font-family: sans-serif; padding: 20px;">
          <tr>
            <td align="center">
              <h1>Hello {{firstName}}!</h1>
              <p>Start building your email here.</p>
            </td>
          </tr>
        </table>
      `);
    }

    setEditor(e);

    return () => {
      e.destroy();
    };
  }, []);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const fullHtml = `<style>${css}</style>${html}`;
      const builderData = editor.getProjectData();
      
      await onSave(subject, fullHtml, builderData);
      toast.success('Template saved successfully!');
    } catch (err: any) {
      toast.error('Failed to save template', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPreview = async () => {
    if (!editor) return;
    setIsSendingTest(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const fullHtml = `<style>${css}</style>${html}`;
      
      await CrmApi.sendTestPreview({ subject: subject || 'Test Preview', html: fullHtml });
      toast.success('Test email sent successfully!');
    } catch (err: any) {
      toast.error('Failed to send test email', { description: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const toggleDevice = (mode: 'desktop' | 'mobile') => {
    if (!editor) return;
    setDevice(mode);
    const targetWidth = mode === 'mobile' ? '320px' : '';
    editor.setDevice(mode === 'mobile' ? 'Mobile portrait' : 'Desktop');
  };

  const handleImportHtml = () => {
    if (!editor || !importHtml.trim()) return;
    editor.setComponents(importHtml);
    setShowImportModal(false);
    setImportHtml('');
    toast.success('HTML snippet imported successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header Toolbar */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex-1 max-w-md flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Subject:</span>
            <Input 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Hello {{firstName}}"
              className="h-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-0.5 bg-muted">
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => toggleDevice('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => toggleDevice('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Code className="w-4 h-4 mr-2" /> Import HTML
          </Button>

          <Button variant="outline" size="sm" onClick={handleTestPreview} disabled={isSendingTest}>
            {isSendingTest ? 'Sending...' : 'Send Test'}
          </Button>
          
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </header>

      {/* Editor Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 h-full" ref={editorRef} />
      </div>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Custom HTML</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Paste your raw HTML snippet here. This will replace the current template contents. You can then use the builder to edit the layout and text.
            </p>
            <Textarea
              value={importHtml}
              onChange={(e) => setImportHtml(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="<html><body>...</body></html>"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button onClick={handleImportHtml}>Import & Replace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
