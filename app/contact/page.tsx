import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual form submission logic
    console.log('Form submitted')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">문의하기</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
          <Input id="name" type="text" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
          <Input id="email" type="email" required />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">문의 내용</label>
          <Textarea id="message" required />
        </div>
        <Button type="submit">문의 보내기</Button>
      </form>
    </div>
  )
}

