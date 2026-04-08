import ReactQuill from 'react-quill'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

function RichTextEditor({ onChange, value }: RichTextEditorProps) {
  return <ReactQuill onChange={onChange} theme="snow" value={value} />
}

export default RichTextEditor
