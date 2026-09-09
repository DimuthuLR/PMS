<template>
  <div class="users-container">
    <div class="header-actions">
      <h1>👥 User Management</h1>
      <button @click="showForm = true"><font-awesome-icon icon="plus" /> Add User</button>
    </div>

    <div class="card" v-if="usersStore.users.length === 0">
      <p>No users found.</p>
    </div>

    <div class="table-wrap" v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersStore.users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </td>
            <td>
              <button class="edit-btn" @click="editUser(user)">
                <font-awesome-icon icon="edit" />
              </button>
              <button class="delete-btn" @click="deleteUser(user.id)">
                <font-awesome-icon icon="trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content card">
        <h2>{{ editing ? 'Edit User' : 'Add New User' }}</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Username</label>
            <input v-model="form.username" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="form.password" type="text" placeholder="Leave blank to keep existing" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit">Save</button>
            <button type="button" class="secondary" @click="closeForm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'

const usersStore = useUsersStore()
const showForm = ref(false)
const editing = ref(false)
let editId = null

const form = reactive({
  username: '',
  email: '',
  password: '',
  role: 'worker',
})

const saveUser = async () => {
  const data = { ...form }
  if (!data.password) delete data.password // don't update password if empty
  if (editing.value) {
    await usersStore.update(editId, data)
  } else {
    // for new user, password is required
    if (!data.password) {
      alert('Password is required for new user.')
      return
    }
    await usersStore.create(data)
  }
  closeForm()
}

const editUser = (user) => {
  editing.value = true
  editId = user.id
  Object.assign(form, user)
  form.password = '' // clear password field
  showForm.value = true
}

const deleteUser = async (id) => {
  // Prevent deleting yourself
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  if (currentUser.id === id) {
    alert('You cannot delete your own account.')
    return
  }
  if (confirm('Delete this user?')) {
    await usersStore.delete(id)
  }
}

const closeForm = () => {
  showForm.value = false
  editing.value = false
  editId = null
  Object.assign(form, { username: '', email: '', password: '', role: 'worker' })
}

onMounted(async () => {
  await usersStore.fetch()
})
</script>

<style scoped>
.users-container {
  padding: 0 0.5rem;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
}
th,
td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
th {
  background: var(--bg-color);
  font-weight: 600;
}
tr:hover {
  background: var(--bg-color);
}
.role-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
.role-badge.admin {
  background: var(--danger);
  color: #fff;
}
.role-badge.manager {
  background: var(--warning);
  color: #1e1e1e;
}
.role-badge.worker {
  background: var(--info);
  color: #fff;
}
.edit-btn,
.delete-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 0 0.2rem;
}
.edit-btn {
  color: var(--info);
}
.delete-btn {
  color: var(--danger);
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  background: var(--card-bg);
}
.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}
.secondary {
  background: var(--border-color);
  color: var(--text-color);
}
</style>
