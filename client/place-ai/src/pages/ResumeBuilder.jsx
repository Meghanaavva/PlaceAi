import { useState } from 'react'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Download, FileText, User, Briefcase, GraduationCap, Code, FolderOpen, Award } from 'lucide-react'

const EMPTY = {
  full_name: '', email: '', phone: '', location: '', linkedin: '', github: '',
  summary: '', experience: '', education: '', skills: '', projects: '', certifications: ''
}

const PLACEHOLDER = {
  full_name:      'Arjun Kumar',
  email:          'arjun@example.com',
  phone:          '+91 98765 43210',
  location:       'Hyderabad, India',
  linkedin:       'linkedin.com/in/arjunkumar',
  github:         'github.com/arjunkumar',
  summary:        'Final-year CS student with strong Python and ML skills. 2 internships at top companies. Passionate about building intelligent systems that solve real-world problems.',
  experience:     'ML Intern — Google India (June 2024 – Aug 2024)\n• Built NLP pipeline achieving 87% accuracy on sentiment classification\n• Reduced model inference time by 40% using quantization techniques\n• Collaborated with 5-person team using Agile methodology\n\nSoftware Intern — Flipkart (Dec 2023 – Feb 2024)\n• Developed REST APIs serving 10,000+ daily requests\n• Improved database query performance by 35%',
  education:      'B.Tech Computer Science & Engineering\nNIT Warangal | 2021 – 2025\nCGPA: 8.7/10\n\nHigher Secondary (CBSE) | 2019 – 2021\nNarayana Junior College, Hyderabad | 94.6%',
  skills:         'Languages: Python, JavaScript, Java, SQL\nFrameworks: TensorFlow, PyTorch, React, FastAPI, Flask\nTools: Git, Docker, Linux, VS Code\nCloud: AWS (S3, EC2), Firebase\nDatabases: PostgreSQL, MongoDB, Redis',
  projects:       'ResumeAI — AI-powered resume analyzer (Python, React, OpenAI)\n• Built full-stack web app with automated resume scoring\n• 500+ users in first month of launch\n\nChatBot Platform — Multi-tenant chatbot SaaS\n• Integrated 5 LLM providers with unified API\n• Reduced response latency by 60% with caching',
  certifications: 'AWS Cloud Practitioner (2024)\nTensorFlow Developer Certificate — Google (2023)\nDeep Learning Specialization — Coursera (2023)'
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

function Input({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100
                   placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500
                   focus:ring-1 focus:ring-blue-500/30 transition-all"
      />
    </div>
  )
}

function Textarea({ label, name, value, onChange, placeholder, rows = 4 }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <textarea
        value={value} onChange={onChange}
        placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100
                   placeholder-slate-600 text-xs resize-y focus:outline-none focus:border-blue-500
                   focus:ring-1 focus:ring-blue-500/30 transition-all leading-relaxed"
      />
    </div>
  )
}
export default function ResumeBuilder() {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const loadSample = () => { setForm(PLACEHOLDER); toast.success('Sample data loaded!') }
  const clearAll   = () => { setForm(EMPTY);       toast('Form cleared') }

  const handleDownload = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Full Name and Email are required')
      return
    }
    setLoading(true)
    try {
      const res = await api.buildPdf(form)
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href     = url
      link.download = `Resume_${form.full_name.replace(/\s+/g, '_')}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Resume PDF downloaded!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'PDF generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Resume Builder</h1>
          <p className="text-slate-400 text-sm mt-1">Fill in your details and download a professional PDF</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadSample}>Load Sample</Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-5">
        <div>
          <FormSection title="Contact Information" icon={User}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Full Name *" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder={PLACEHOLDER.full_name} />
                <Input label="Email *"     name="email"     value={form.email}     onChange={set('email')}     placeholder={PLACEHOLDER.email} type="email" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone"    name="phone"    value={form.phone}    onChange={set('phone')}    placeholder={PLACEHOLDER.phone} />
                <Input label="Location" name="location" value={form.location} onChange={set('location')} placeholder={PLACEHOLDER.location} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={set('linkedin')} placeholder={PLACEHOLDER.linkedin} />
                <Input label="GitHub"   name="github"   value={form.github}   onChange={set('github')}   placeholder={PLACEHOLDER.github} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Professional Summary" icon={FileText}>
            <Textarea name="summary" value={form.summary} onChange={set('summary')} placeholder={PLACEHOLDER.summary} rows={3} />
          </FormSection>

          <FormSection title="Skills" icon={Code}>
            <Textarea name="skills" value={form.skills} onChange={set('skills')} placeholder={PLACEHOLDER.skills} rows={4} />
          </FormSection>
        </div>

        <div>
          <FormSection title="Work Experience" icon={Briefcase}>
            <Textarea name="experience" value={form.experience} onChange={set('experience')} placeholder={PLACEHOLDER.experience} rows={6} />
          </FormSection>

          <FormSection title="Education" icon={GraduationCap}>
            <Textarea name="education" value={form.education} onChange={set('education')} placeholder={PLACEHOLDER.education} rows={4} />
          </FormSection>

          <FormSection title="Projects" icon={FolderOpen}>
            <Textarea name="projects" value={form.projects} onChange={set('projects')} placeholder={PLACEHOLDER.projects} rows={4} />
          </FormSection>

          <FormSection title="Certifications" icon={Award}>
            <Textarea name="certifications" value={form.certifications} onChange={set('certifications')} placeholder={PLACEHOLDER.certifications} rows={3} />
          </FormSection>
        </div>
      </div>

      {/* Download Button */}
      <div className="sticky bottom-6 flex justify-center mt-6">
        <Button size="lg" onClick={handleDownload} loading={loading} className="shadow-2xl shadow-blue-500/30 px-10">
          <Download className="w-4 h-4" />
          {loading ? 'Generating PDF...' : 'Download Professional PDF'}
        </Button>
      </div>
    </div>
  )
}