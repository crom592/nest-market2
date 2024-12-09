import { cn } from "@/lib/utils"

export default function CategoryNav() {
  const categories = [
    { id: 1, name: "전자제품", active: true },
    { id: 2, name: "가전제품", active: false },
    { id: 3, name: "인터넷/휴대폰", active: false },
    { id: 4, name: "렌탈", active: false },
  ]

  return (
    <div className="flex items-center justify-between gap-2 py-4">
      {categories.map((category, index) => (
        <div key={category.id} className="flex items-center">
          <button
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              category.active
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {category.name}
          </button>
          {index < categories.length - 1 && (
            <div className="mx-2 h-px w-4 bg-gray-300" />
          )}
        </div>
      ))}
    </div>
  )
}

