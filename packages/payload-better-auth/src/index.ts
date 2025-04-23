/*
 Copyright (C) 2025 Benedetto Abbenanti

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// exports
export * from './types.js'
export * from './plugin.js'
export * from './singleton.better-auth.js'
export { createAuthLayer } from './nextjs/index.js'

export {
  defaultStatements,
  ac,
  userAc,
  adminAc,
  roles,
} from './better-auth/permissions.js'
