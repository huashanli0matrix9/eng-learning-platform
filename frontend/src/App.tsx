import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import VocabularyList from './pages/VocabularyList'
import WordDetail from './pages/WordDetail'
import DailyWords from './pages/DailyWords'
import Review from './pages/Review'
import Categories from './pages/Categories'
import SignIn from './pages/SignIn'
import WordSearch from './pages/WordSearch'
import PhrasalVerbs from './pages/PhrasalVerbs'
import PhrasalVerbDetail from './pages/PhrasalVerbDetail'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vocabulary" element={<VocabularyList />} />
        <Route path="/vocabulary/:category" element={<VocabularyList />} />
        <Route path="/words/:id" element={<WordDetail />} />
        <Route path="/daily" element={<DailyWords />} />
        <Route path="/review" element={<Review />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<WordSearch />} />
        <Route path="/phrasal-verbs" element={<PhrasalVerbs />} />
        <Route path="/phrasal-verbs/:id" element={<PhrasalVerbDetail />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Layout>
  )
}
