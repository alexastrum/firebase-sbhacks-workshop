/**
 * Firebase utilities allowing intuitive usage of Firebase Web SDK with Vue.js Composition API.
 *
 * For performance and stability reasons, we strongly recommend using this library only with Vue.js 3 in any production environment.
 */

import { ComputedRef, reactive, Ref, ref, shallowRef, unref, UnwrapRef, watchEffect } from '@vue/composition-api'
import firebase from 'firebase/app'

export interface FirebaseAppOptions {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export async function useFirebase (
  {
    firebaseConfig,
    name = undefined,
    enableFirestorePersistance = false
  }: {
    firebaseConfig: FirebaseAppOptions,
    name?: string,
    enableFirestorePersistance?: boolean
  }
) {
  try {
    // Workaround to only initialiaze Firebase once, by catching the exception thrownif not yet initialized.
    return firebase.app(name)
  } catch (e) {
    debugLog(`[Firebase] Initialize app ${name || ''}`)
    firebase.initializeApp(firebaseConfig, name)
    if (enableFirestorePersistance) {
      await firebase
        .firestore()
        .enablePersistence({ synchronizeTabs: true })
      debugLog('[Firebase] Offline support for Firestore enabled')
    }
  }
  return firebase.app(name)
}

export interface UserInfo extends firebase.UserInfo {
  isAnonymous: boolean;
  emailVerified: boolean;
  metadata: firebase.auth.UserMetadata;
  providerData: (firebase.UserInfo | null)[];
  tenantId: string | null;
}

export function useFirebaseAuth<T = undefined> (
  {
    app = undefined,
    dataCollection = undefined,
    dataGetter = undefined
  }: {
    app?: firebase.app.App,
    dataCollection?: firebase.firestore.CollectionReference<T>,
    dataGetter?: (user: firebase.User) => T
  } = {}
) {
  const auth = reactive<{
    ready: boolean, signedIn: boolean, currentUser: UserInfo | null, currentUserData: T | null
  }>({
    ready: false, signedIn: false, currentUser: null, currentUserData: null
  })

  watchEffect((onInvalidate) => {
    debugLog('[Firebase] Subscribing to auth state')
    let unsubscribeCurrentUserData: () => void | undefined
    const unsubscribeAuthState = firebase.auth(app).onAuthStateChanged(user => {
      unsubscribeCurrentUserData && unsubscribeCurrentUserData()
      debugLog('[Firebase] Auth state changed:', user)
      auth.signedIn = !!user

      if (!user) {
        auth.currentUser = auth.currentUserData = null
        auth.ready = true
        return
      }

      // Prepare Firebase Auth user info for display.
      const { displayName, email, phoneNumber, photoURL, providerId, uid, emailVerified, isAnonymous, metadata, providerData, tenantId } = user
      auth.currentUser = { displayName, email, phoneNumber, photoURL, providerId, uid, emailVerified, isAnonymous, metadata, providerData, tenantId }

      if (!dataCollection) {
        auth.ready = true
        return
      }

      // Fetch user data from Firestore.
      debugLog('[Firebase] Subscribing to current user data')
      const doc = dataCollection?.doc(user.uid)
      unsubscribeCurrentUserData = doc.onSnapshot(docSnap => {
        const docData = docSnap.data({ serverTimestamps: 'estimate' }) as UnwrapRef<T>
        debugLog(`[Firebase] Current user "${doc.path}" snapshot:`, docData)
        auth.currentUserData = docData

        if (docData || !dataGetter) {
          auth.ready = true
          return
        }

        // Get and save default user data.
        doc.set(dataGetter(user)).finally(() => undefined)
      })
    })

    onInvalidate(() => {
      debugLog('[Firebase] Unsubscribing from auth state')
      unsubscribeAuthState()
      unsubscribeCurrentUserData && unsubscribeCurrentUserData()
      auth.ready = auth.signedIn = false
      auth.currentUser = auth.currentUserData = null
    })
  })
  return auth
}

type RefOrGetter<T> = (() => T | null) | Ref<T | null> | T;

function computedUnref<T> (refOrGetter: RefOrGetter<T>): T | null {
  // eslint-disable-next-line
  return typeof refOrGetter === 'function' ? (refOrGetter as any)() : unref(refOrGetter)
}

/**
 * Computes a ref that tracks its own value for meaningful changes.
 * Useful when the computed result is to be used in expesive or slow effects.
 *
 * @param refOrGetter
 * @param isEqual
 * @returns A shallow ref to the last computed object that was not equal with the previous result
 */
export function computedComparable<T> (
  refOrGetter: RefOrGetter<T>,
  isEqual: (currValue: T | null, newValue: T | null) => boolean
): ComputedRef<T | null> {
  const result: Ref<T | null> = shallowRef(null)
  let currValue: T | null = null
  watchEffect(() => {
    const newValue = computedUnref(refOrGetter)
    if (isEqual(currValue, newValue)) {
      return currValue
    }
    result.value = currValue = newValue
  })
  return result
}

function computedFirestoreComparable<V extends { isEqual: (other: V) => boolean }> (
  refOrGetter: (() => V | null) | Ref<V | null> | V
) {
  return computedComparable(refOrGetter,
    (currValue, newValue) =>
      currValue && newValue
        ? currValue.isEqual(newValue)
        : !currValue && !newValue) // both null or empty
}

export interface FirestoreQueryDoc<T> {
  id: string;
  data: T;
  metadata: firebase.firestore.SnapshotMetadata | null;
}

export type FirestoreQueryResult<T> = Ref<FirestoreQueryDoc<T>[] | null>;

/**
 * Subscribes to a query or collection.
 *
 * Sample usage:
 * ```
 * function setup(props) {
 *   const auth = useFirebaseAuth();
 *   const allTags = useFirestoreQuery(firebase.firestore().collection('tags'))
 *   const currentUsersComments = useFirestoreQuery(() => auth.currentUser &&
 *     firebase.firestore().collection('comments').where('uid', '==', auth.currentUser.uid))
 *   return { allTags, currentUsersComments }
 * }
 * ```
 * @param queryRef
 * @param options
 * @returns A reactive ref to the list of Firestore documents, containing ids, data and metadata.
 */
export function useFirestoreQuery<T> (
  queryRef: RefOrGetter<firebase.firestore.Query<T>>,
  {
    snapshotListenOptions = { includeMetadataChanges: false },
    snapshotOptions = { serverTimestamps: 'estimate' },
    debugName = ''
  }: {
    snapshotListenOptions?: firebase.firestore.SnapshotListenOptions,
    snapshotOptions?: firebase.firestore.SnapshotOptions
    debugName?: string
  } = {}
): FirestoreQueryResult<T> {
  const result = ref<FirestoreQueryDoc<T>[] | null>(null)
  result.value = null
  const computedQuery = computedFirestoreComparable(queryRef)
  watchEffect(onInvalidate => {
    const query = computedQuery.value

    if (!query) {
      debugLog('[Firebase] Skipped subscribing to null query')
      result.value = null
      return
    }

    const path = debugName || (query as unknown as firebase.firestore.CollectionReference).path || ''
    debugLog(`[Firebase] Subscribing to query ${path}`)
    const unsubscribe = query.onSnapshot(snapshotListenOptions, snap => {
      const docs = snap.docs.map(docSnap => ({
        id: docSnap.id,
        data: docSnap.data(snapshotOptions),
        metadata: snapshotListenOptions.includeMetadataChanges ? docSnap.metadata : null
      } as FirestoreQueryDoc<T>))
      debugLog(`[Firebase] Query "${path || snap.docs[0]?.ref.parent.path}" snapshot:`, docs)
      result.value = docs
    })

    onInvalidate(() => {
      debugLog(`[Firebase] Unsubscribing from query ${path}`)
      unsubscribe()
    })
  })
  return result
}

export interface FirestoreDoc<T> {
  id: string | null;
  ready: boolean;
  exists: boolean;
  metadata: firebase.firestore.SnapshotMetadata | null;
  data: T | null;
}

export type FirestoreDocResult<T> = FirestoreDoc<UnwrapRef<T>>;

/**
 * Subscribes to a document.
 *
 * Sample usage:
 * ```
 * function setup(props) {
 *   const settingsCollection = firebase.firestore().collection('settings');
 *   const globalSettings = useFirestoreDoc(settingsCollection.doc('*'))
 *   const projectSettings = useFirestoreDoc(() => settingsCollection.doc(props.projectId))
 *   return { globalSettings, projectSettings }
 * }
 * ```
 * @param docRef
 * @returns A reactive object that contains document id, data and metadata.
 */
export function useFirestoreDoc<T> (
  docRef: RefOrGetter<firebase.firestore.DocumentReference<T>>,
  {
    snapshotListenOptions = { includeMetadataChanges: false },
    snapshotOptions = { serverTimestamps: 'estimate' }
  }: {
    snapshotListenOptions?: firebase.firestore.SnapshotListenOptions,
    snapshotOptions?: firebase.firestore.SnapshotOptions
  } = {}
): FirestoreDocResult<T> {
  const result = reactive<FirestoreDoc<T>>({ id: null, data: null, metadata: null, exists: false, ready: false })
  const computedDocRef = computedFirestoreComparable(docRef)
  watchEffect(onInvalidate => {
    const doc = computedDocRef.value

    if (!doc) {
      debugLog('[Firebase] Skipped subscribing to null document reference')
      result.id = result.data = result.metadata = null
      result.exists = false
      result.ready = true
      return
    }

    debugLog(`[Firebase] Subscribing to document ${doc.path}`)
    const unsubscribe = doc.onSnapshot(snapshotListenOptions, docSnap => {
      const docData = docSnap.data(snapshotOptions)
      debugLog(`[Firebase] Document "${doc.path}" snapshot:`, docData)
      result.id = doc.id
      result.exists = docSnap.exists
      result.data = docData as UnwrapRef<T>
      result.metadata = snapshotListenOptions.includeMetadataChanges ? docSnap.metadata : null
      result.ready = true
    })

    onInvalidate(() => {
      debugLog(`[Firebase] Unsubscribing from document ${doc.path}`)
      unsubscribe()
      result.id = result.data = result.metadata = null
      result.exists = result.ready = false
    })
  })
  return result
}

/**
 * Makes promises reactive.
 *
 * Sample usage with Firebase Storage:
 * ```
 * function setup(props) {
 *   const staticURL = usePromise(firebase.storage().ref('path/to/static/img.jpg').getDownloadURL())
 *   const dynamicURL = usePromise(() => firebase.storage().ref(`path/to/dynamic/${props.filename}`).getDownloadURL())
 *   return { staticURL, dynamicURL }
 * }
 * ```
 *
 * Sample usage with Firestore:
 * ```
 * function setup(props) {
 *   const auth = useFirebaseAuth();
 *   const currentUsersComments = usePromise(() => auth.currentUser && firebase.firestore().collection(`users/${auth.currentUser.uid}/comments`).get())
 *   return { scurrentUsersComments }
 * }
 * ```
 *
 * Sample usage with Fetch API:
 * ```
 * function setup(props) {
 *   const controller = new AbortController();
 *   const { signal } = controller;
 *   const response = usePromise(() => fetch(props.url, { signal }).then(response => response.json()), {onAbort: () => controller.abort()})
 *   return { response }
 * }
 * ```
 *
 * @param promiseRef
 * @param options
 * @returns A reactive object that will contain the resolved promise result.
 */
export function usePromise<T> (
  promiseRef: RefOrGetter<Promise<T>>,
  {
    onAbort = undefined,
    defaultValue = null,
    debugName = ''
  }: {
    onAbort?: (promise: Promise<T>) => void,
    defaultValue?: T | null,
    debugName?: string
  } = {}
) {
  const result = reactive<{ ready: boolean, value: T | null }>({ ready: false, value: null })
  let pendingPromise: Promise<T> | null
  watchEffect(onInvalidate => {
    debugLog(`[Firebase] Awaiting promise ${debugName}`)
    const promise = computedUnref(promiseRef)
    pendingPromise = promise

    if (!promise) {
      result.ready = true
      result.value = defaultValue as UnwrapRef<T>
      return
    }

    promise.then(value => {
      if (promise !== pendingPromise) {
        return
      }
      debugLog(`[Firebase] Promise resolved ${debugName}`, value)
      result.value = value as UnwrapRef<T>
    }).catch(e => {
      if (promise !== pendingPromise) {
        throw e
      }
      debugLog(`[Firebase] Promise rejected ${debugName}`)
      result.value = defaultValue as UnwrapRef<T>
      throw e
    }).finally(() => {
      if (promise !== pendingPromise) {
        return
      }
      pendingPromise = null
      result.ready = true
    })

    onInvalidate(() => {
      if (pendingPromise && onAbort) {
        debugLog(`[Firebase] Aborting promise ${debugName}`)
        onAbort(promise)
      }
      if (promise !== pendingPromise) {
        throw new Error('Invalid promise in onInvalidate. You probably found an usePromise bug')
      }
      result.value = pendingPromise = null
      result.ready = false
    })
  })
  return result
}

// eslint-disable-next-line
let debugLog = (msg: string, obj?: unknown) => { }

if (process.env.NODE_ENV === 'development') {
  debugLog = console.debug.bind(console)
}
