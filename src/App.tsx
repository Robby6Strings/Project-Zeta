import * as Cinnabun from "cinnabun"
import { Router, Route, Link } from "cinnabun/router"
import { pathStore } from "./state"
import { UserList } from "./components/UserList"
import { AuthLinks } from "./components/AuthLinks"
import { PollsPage } from "./pages/Polls"

const Navigation = () => (
  <nav>
    <ul>
      <li>
        <Link to="/" store={pathStore}>
          Home
        </Link>
      </li>
      <li>
        <Link to="/users" store={pathStore}>
          Users
        </Link>
      </li>
      <li>
        <Link to="/polls" store={pathStore}>
          Polls
        </Link>
      </li>
      <li>
        <AuthLinks />
      </li>
    </ul>
  </nav>
)

const Header = () => {
  return (
    <header>
      <div id="logo">Logo</div>
      <Navigation />
    </header>
  )
}

export const App = () => {
  return (
    <>
      <Header />
      <main>
        <Router store={pathStore}>
          <Route path="/" component={<h3>Home</h3>} />
          <Route path="/users" component={<UserList />} />
          <Route path="/polls" component={<PollsPage />} />
        </Router>
      </main>
    </>
  )
}
