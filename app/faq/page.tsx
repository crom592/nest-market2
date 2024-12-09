import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    { question: "둥지마켓은 어떤 서비스인가요?", answer: "둥지마켓은 공동구매 플랫폼입니다. 여러 사람이 모여 더 좋은 가격에 제품을 구매할 수 있습니다." },
    { question: "어떻게 공구에 참여할 수 있나요?", answer: "원하는 공구를 찾아 '참여하기' 버튼을 클릭하면 됩니다. 로그인이 필요할 수 있습니다." },
    { question: "공구 등록은 어떻게 하나요?", answer: "로그인 후 '공구 등록하기' 메뉴에서 필요한 정보를 입력하여 등록할 수 있습니다." },
    { question: "결제는 언제 이루어지나요?", answer: "공구가 성사되면 개별적으로 안내를 드리며, 그 시점에 결제가 이루어집니다." },
    { question: "공구가 취소되면 어떻게 되나요?", answer: "공구가 취소될 경우, 참여자들에게 즉시 알림이 가며 결제가 이루어졌다면 전액 환불됩니다." },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">자주 묻는 질문</h1>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

