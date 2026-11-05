import { useNavigation } from 'expo-router'
import { CLOSE_DRAWER, LinksModal } from '@/features/chat'

const LinksRoute = () => {
  const navigation = useNavigation()
  return <LinksModal onUse={() => navigation.dispatch(CLOSE_DRAWER)} />
}

export default LinksRoute
