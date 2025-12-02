import { useEffect } from 'react'
import './App.css'
import { DashboardController, PostsController, UserController } from './controllers/DashboardControllers'
import { useController } from './hooks/useController'

const userController = new UserController()
const postsController = new PostsController()
const dashboardController = new DashboardController(userController, postsController)

function Header() {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">MobX controllers care depind unul de altul</p>
        <h1>Orchestrare asincrona</h1>
        <p className="muted">
          Exemplu simplu in care un controller MobX asteapta date din alt controller inainte de a-si
          continua logica.
        </p>
      </div>
      <div className="actions">
        <a className="link" href="https://jsonplaceholder.typicode.com" target="_blank" rel="noreferrer">
          Endpointuri JSONPlaceholder
        </a>
      </div>
    </header>
  )
}

function UserCard() {
  const userStore = useController(userController)

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Controller utilizator</p>
          <h2>Utilizator principal</h2>
        </div>
        {userStore.loading && <span className="chip">Se incarca…</span>}
      </div>
      {userStore.error && <p className="error">{userStore.error}</p>}
      {userStore.user ? (
        <dl className="details">
          <div>
            <dt>Nume</dt>
            <dd>{userStore.user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{userStore.user.email}</dd>
          </div>
          {userStore.user.company && (
            <div>
              <dt>Companie</dt>
              <dd>{userStore.user.company.name}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="muted">Nu exista date inca.</p>
      )}
      <button onClick={() => userStore.fetchUser(1)} className="button">
        Reincarca utilizator
      </button>
    </section>
  )
}

function PostsList() {
  const postsStore = useController(postsController)
  const userStore = useController(userController)

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Controller postari</p>
          <h2>Postari pentru utilizator</h2>
        </div>
        {postsStore.loading && <span className="chip">Se incarca…</span>}
      </div>
      {postsStore.waitingForUser && <p className="info">Postarile asteapta datele utilizatorului.</p>}
      {postsStore.error && <p className="error">{postsStore.error}</p>}
      {postsStore.posts.length > 0 ? (
        <ul className="posts">
          {postsStore.posts.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nu sunt postari incarcate.</p>
      )}
      <div className="actions">
        <button
          className="button"
          onClick={() => postsStore.fetchPostsForUser(userStore.user?.id)}
          disabled={postsStore.loading}
        >
          Incarca postari pentru utilizatorul curent
        </button>
      </div>
    </section>
  )
}

function DemoFlows() {
  const dashboard = useController(dashboardController)
  const users = useController(userController)
  const posts = useController(postsController)

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Orchestrare</p>
          <h2>Fluxuri coordonate</h2>
        </div>
        {dashboard.busy && <span className="chip">Cereri active</span>}
      </div>
      <p>
        <strong>loadUserThenPosts</strong> incarca utilizatorul si abia apoi postarile.
      </p>
      <p>
        <strong>loadPostsWithDependency</strong> cere postarile imediat. Daca nu exista utilizator,
        PostsController ramane in modul de asteptare pana cand DashboardController termina cererea de
        utilizator si o reia pe cea de postari.
      </p>
      <div className="stacked">
        <button className="button" onClick={() => dashboard.loadUserThenPosts()} disabled={dashboard.busy}>
          Incarca utilizator → postari
        </button>
        <button className="button" onClick={() => dashboard.loadPostsWithDependency()} disabled={dashboard.busy}>
          Cere postari (cu asteptare daca lipseste utilizatorul)
        </button>
      </div>
      <div className="status">
        <p>
          <strong>Utilizator:</strong> {users.loading ? 'se incarca…' : users.user ? users.user.name : 'gol'}
        </p>
        <p>
          <strong>Postari:</strong>{' '}
          {posts.loading
            ? 'se incarca…'
            : posts.posts.length > 0
              ? `${posts.posts.length} postari`
              : posts.waitingForUser
                ? 'in asteptare dupa utilizator'
                : 'goale'}
        </p>
      </div>
    </section>
  )
}

function App() {
  useEffect(() => {
    void dashboardController.loadUserThenPosts()
  }, [])

  return (
    <main className="layout">
      <Header />
      <div className="grid">
        <UserCard />
        <PostsList />
      </div>
      <DemoFlows />
    </main>
  )
}

export default App
