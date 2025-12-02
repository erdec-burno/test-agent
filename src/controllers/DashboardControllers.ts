import { ObservableController, makeAutoObservable, runInAction } from '../mobx-lite'

export type User = {
  id: number
  name: string
  email: string
  company?: { name: string }
}

export type Post = {
  id: number
  userId: number
  title: string
  body: string
}

export class UserController extends ObservableController {
  user?: User
  loading = false
  error = ''

  constructor() {
    super()
    makeAutoObservable(this)
  }

  get userId() {
    return this.user?.id
  }

  async fetchUser(id = 1) {
    this.update(() => {
      this.loading = true
      this.error = ''
    })

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
      if (!response.ok) {
        throw new Error('Nu am putut incarca utilizatorul')
      }
      const data = (await response.json()) as User
      runInAction(() => {
        this.user = data
        this.error = ''
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Eroare necunoscuta'
        this.user = undefined
      })
    } finally {
      this.update(() => {
        this.loading = false
      })
    }
  }
}

export class PostsController extends ObservableController {
  posts: Post[] = []
  loading = false
  error = ''
  waitingForUser = false

  constructor() {
    super()
    makeAutoObservable(this)
  }

  async fetchPostsForUser(userId?: number) {
    if (!userId) {
      this.update(() => {
        this.waitingForUser = true
        this.error = 'Astept utilizatorul inainte de a incarca postarile.'
      })
      return
    }

    this.update(() => {
      this.loading = true
      this.error = ''
      this.waitingForUser = false
    })

    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${encodeURIComponent(userId)}`,
      )
      if (!response.ok) {
        throw new Error('Nu am putut incarca postarile')
      }
      const data = (await response.json()) as Post[]
      runInAction(() => {
        this.posts = data
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Eroare necunoscuta'
        this.posts = []
      })
    } finally {
      this.update(() => {
        this.loading = false
      })
    }
  }
}

export class DashboardController extends ObservableController {
  private readonly users: UserController
  private readonly posts: PostsController

  constructor(users: UserController, posts: PostsController) {
    super()
    this.users = users
    this.posts = posts
    makeAutoObservable(this)
  }

  async loadUserThenPosts() {
    await this.users.fetchUser(1)
    await this.posts.fetchPostsForUser(this.users.userId)
    this.notify()
  }

  async loadPostsWithDependency() {
    // Intentionally cerem postarile inainte sa stim utilizatorul pentru a demonstra blocarea.
    await this.posts.fetchPostsForUser(this.users.userId)
    if (!this.users.user) {
      await this.users.fetchUser(1)
      await this.posts.fetchPostsForUser(this.users.userId)
    }
    this.notify()
  }

  get userController() {
    return this.users
  }

  get postsController() {
    return this.posts
  }

  get busy() {
    return this.users.loading || this.posts.loading
  }
}
