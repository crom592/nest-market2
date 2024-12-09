import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import GroupPurchaseList from '../components/GroupPurchaseList'

export default function MyPurchases() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">내 공구</h1>
      <Tabs defaultValue="participating">
        <TabsList>
          <TabsTrigger value="participating">참여 중인 공구</TabsTrigger>
          <TabsTrigger value="created">등록한 공구</TabsTrigger>
          <TabsTrigger value="completed">완료된 공구</TabsTrigger>
        </TabsList>
        <TabsContent value="participating">
          <GroupPurchaseList />
        </TabsContent>
        <TabsContent value="created">
          <GroupPurchaseList />
        </TabsContent>
        <TabsContent value="completed">
          <GroupPurchaseList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

