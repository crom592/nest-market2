export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary-dark text-white">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-5xl font-bold text-center mb-6">
            둥지 마켓 소개
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto mb-12 text-gray-100">
            소비자가 주도하는 혁신적인 공동 구매 플랫폼, 둥지 마켓에서 더 나은 거래를 경험하세요.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">우리의 미션</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              둥지 마켓은 소비자들이 원하는 제품과 서비스를 직접 제안하고, 판매자들과 직접 소통하며
              최적의 거래를 만들어가는 새로운 방식의 마켓플레이스입니다.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              우리는 투명한 거래와 공정한 가격, 그리고 신뢰할 수 있는 커뮤니티를 만들어가는 것을 목표로 합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary-light">
              <h3 className="text-xl font-semibold mb-4 text-primary-dark">공동 구매 제안</h3>
              <p className="text-gray-600">원하는 제품이나 서비스에 대한 공동 구매를 직접 제안하고 참여자를 모집할 수 있습니다.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary">
              <h3 className="text-xl font-semibold mb-4 text-primary-dark">판매자 입찰</h3>
              <p className="text-gray-600">검증된 판매자들이 공동 구매 제안에 대해 경쟁력 있는 가격을 제시합니다.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary-dark">
              <h3 className="text-xl font-semibold mb-4 text-primary-dark">투명한 거래</h3>
              <p className="text-gray-600">전체 거래 과정이 투명하게 공개되며, 참여자들의 의견이 반영됩니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">1,000+</div>
              <div className="text-gray-600">활성 공동구매</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">5,000+</div>
              <div className="text-gray-600">만족한 구매자</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-gray-600">검증된 판매자</div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Section */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary-dark text-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold mb-6">함께 성장하는 둥지 마켓</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-100">
            더 나은 거래 문화를 만들어가는 둥지 마켓과 함께하세요.
            소비자가 주도하는 새로운 방식의 거래를 경험해보세요.
          </p>
          <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
