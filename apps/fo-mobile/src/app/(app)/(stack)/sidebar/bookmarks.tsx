import { useNavigation } from 'expo-router'
import { BookmarksModal, CLOSE_DRAWER } from '@/features/chat'

const BookmarksRoute = () => {
  const navigation = useNavigation()
  return <BookmarksModal onDone={() => navigation.dispatch(CLOSE_DRAWER)} />
}

export default BookmarksRoute
