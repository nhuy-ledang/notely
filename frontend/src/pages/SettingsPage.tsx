import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePersonalization } from '@/contexts/personalization-context'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { ApiError, authApi } from '@/lib/api'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-xs font-semibold uppercase tracking-wider text-secondary">{children}</span>
  )
}

function SectionAside({ title, description, titleClassName }: { title: string; description: string; titleClassName?: string }) {
  return (
    <div className="w-full md:w-1/3">
      <h2 className={`font-manrope text-xl font-bold text-on-surface ${titleClassName ?? ''}`}>{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant font-body">{description}</p>
    </div>
  )
}

function Switch({ checked, onChange, size = 'md' }: { checked: boolean; onChange: (v: boolean) => void; size?: 'md' | 'sm' }) {
  const track = size === 'md' ? 'h-6 w-11' : 'h-5 w-10'
  const knob = size === 'md' ? 'after:h-5 after:w-5 after:top-[2px] after:left-[2px]' : 'after:h-4 after:w-4 after:top-[2px] after:left-[2px]'
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`peer relative shrink-0 rounded-full bg-surface-container-high transition-colors after:absolute after:rounded-full after:border after:border-outline-variant/40 after:bg-surface-container-lowest after:transition-transform peer-checked:bg-primary-container peer-checked:after:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${track} ${knob}`}
      />
    </label>
  )
}

function prefBool(prefs: Record<string, unknown> | undefined, key: string, fallback: boolean): boolean {
  const v = prefs?.[key]
  return typeof v === 'boolean' ? v : fallback
}

export function SettingsPage() {
  const { user, token, logout, patchProfile, deleteAccount, refreshMe } = useAuth()
  const { locale, setLocale, t } = useLocale()
  const { openModal, preferences: persPrefs } = usePersonalization()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [libraryHidden, setLibraryHidden] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [emailMonthly, setEmailMonthly] = useState(true)
  const [emailCollaborator, setEmailCollaborator] = useState(false)
  const [pushSync, setPushSync] = useState(true)
  const [pushTagging, setPushTagging] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordOk, setPasswordOk] = useState(false)

  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const oauthOnlyPassword = user?.oauth_only_password === true
  const needsCurrentPassword = !oauthOnlyPassword

  useEffect(() => {
    document.title = t('settings.docTitle')
  }, [t])

  useEffect(() => {
    if (!user) {
      return
    }
    const p = user.preferences as Record<string, unknown> | undefined
    setName(user.name ?? '')
    setEmail(user.email ?? '')
    setLibraryHidden(prefBool(p, 'library_hidden', false))
    setTwoFactor(prefBool(p, 'two_factor_enabled', false))
    setEmailMonthly(prefBool(p, 'email_monthly_summary', true))
    setEmailCollaborator(prefBool(p, 'email_collaborator_suggestions', false))
    setPushSync(prefBool(p, 'push_sync_notifications', true))
    setPushTagging(prefBool(p, 'push_tagging_alerts', true))
  }, [user])

  const handleSave = useCallback(async () => {
    setSaveError(null)
    setSaveOk(false)
    setSaving(true)
    try {
      await patchProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        preferences: {
          ...(user?.preferences ?? {}),
          locale,
          theme: persPrefs.theme,
          accent: persPrefs.accent,
          font: persPrefs.font,
          library_hidden: libraryHidden,
          two_factor_enabled: twoFactor,
          email_monthly_summary: emailMonthly,
          email_collaborator_suggestions: emailCollaborator,
          push_sync_notifications: pushSync,
          push_tagging_alerts: pushTagging,
        },
      })
      setSaveOk(true)
      window.setTimeout(() => setSaveOk(false), 3200)
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.message)
          : e instanceof Error
            ? e.message
            : t('settings.saveFailed')
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }, [
    patchProfile,
    user?.preferences,
    name,
    email,
    libraryHidden,
    persPrefs.theme,
    persPrefs.accent,
    persPrefs.font,
    twoFactor,
    emailMonthly,
    emailCollaborator,
    pushSync,
    pushTagging,
    locale,
    t,
  ])

  const handleUpdatePassword = useCallback(async () => {
    if (!token) {
      return
    }
    setPasswordError(null)
    setPasswordOk(false)
    if (newPassword.length < 8) {
      setPasswordError(t('settings.passwordMin'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'))
      return
    }
    if (needsCurrentPassword && !currentPassword.trim()) {
      setPasswordError(t('settings.passwordNeedCurrent'))
      return
    }
    setPasswordBusy(true)
    try {
      await authApi.updatePassword(token, {
        ...(needsCurrentPassword ? { current_password: currentPassword } : {}),
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordOk(true)
      window.setTimeout(() => setPasswordOk(false), 3200)
      await refreshMe()
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.message)
          : e instanceof Error
            ? e.message
            : t('settings.saveFailed')
      setPasswordError(msg)
    } finally {
      setPasswordBusy(false)
    }
  }, [
    token,
    newPassword,
    confirmPassword,
    currentPassword,
    needsCurrentPassword,
    refreshMe,
    t,
  ])

  const handleDeleteAccount = useCallback(async () => {
    if (!window.confirm(t('settings.deleteConfirm'))) {
      return
    }
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await deleteAccount()
      navigate('/login', { replace: true })
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.message)
          : e instanceof Error
            ? e.message
            : t('settings.deleteFailed')
      setDeleteError(msg)
    } finally {
      setDeleteBusy(false)
    }
  }, [deleteAccount, navigate, t])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative mx-auto max-w-4xl px-6 pb-36 pt-2 md:px-8 lg:px-12">
      <header className="mb-12">
        <h1 className="mb-2 font-manrope text-4xl font-extrabold tracking-tight text-on-surface">
          {t('settings.pageTitle')}
        </h1>
        <p className="text-on-surface-variant font-body">{t('settings.pageSubtitle')}</p>
      </header>

      <div className="space-y-12">
        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside title={t('settings.languageTitle')} description={t('settings.languageDesc')} />
            <div className="w-full md:w-2/3">
              <div className="flex flex-wrap gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm dark:border-outline-variant/25">
                {(['vi', 'en'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => void setLocale(code)}
                    className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                      locale === code
                        ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                        : 'border border-outline-variant/40 bg-surface-container text-on-surface hover:bg-surface-container-high dark:border-outline-variant/30'
                    }`}
                  >
                    {code === 'vi' ? t('settings.langVi') : t('settings.langEn')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside
              title={t('settings.appearanceTitle')}
              description={t('settings.appearanceDesc')}
            />
            <div className="w-full space-y-6 md:w-2/3">
              <div className="space-y-6 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm dark:border-outline-variant/25">
                <p className="text-sm text-on-surface-variant font-body">
                  {t('settings.openPersonalizationHint')}
                </p>
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="w-full rounded-xl bg-primary-container py-3 text-sm font-bold text-on-primary shadow-md shadow-primary-container/20 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] sm:w-auto sm:px-8"
                >
                  {t('settings.openPersonalizationCta')}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside title={t('settings.personalTitle')} description={t('settings.personalDesc')} />
            <div className="w-full md:w-2/3">
              <div className="space-y-6 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm dark:border-outline-variant/25">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>{t('settings.displayName')}</FieldLabel>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container p-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/60 focus:border-primary-container/40 focus:ring-2 focus:ring-primary-container/35"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>{t('settings.emailAddress')}</FieldLabel>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container p-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/60 focus:border-primary-container/40 focus:ring-2 focus:ring-primary-container/35"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-4 border-t border-outline-variant/10 pt-4 dark:border-outline-variant/20">
                  <FieldLabel>{t('settings.changePassword')}</FieldLabel>
                  {oauthOnlyPassword ? (
                    <p className="text-xs leading-relaxed text-on-surface-variant font-body">{t('settings.passwordGoogleHint')}</p>
                  ) : null}
                  {needsCurrentPassword ? (
                    <div className="space-y-2">
                      <FieldLabel>{t('settings.passwordCurrent')}</FieldLabel>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container p-3 text-sm text-on-surface transition-all focus:border-primary-container/40 focus:ring-2 focus:ring-primary-container/35"
                      />
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel>{t('settings.passwordNew')}</FieldLabel>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container p-3 text-sm text-on-surface transition-all focus:border-primary-container/40 focus:ring-2 focus:ring-primary-container/35"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>{t('settings.passwordConfirm')}</FieldLabel>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container p-3 text-sm text-on-surface transition-all focus:border-primary-container/40 focus:ring-2 focus:ring-primary-container/35"
                      />
                    </div>
                  </div>
                  {passwordError ? <p className="text-sm font-medium text-error">{passwordError}</p> : null}
                  {passwordOk ? (
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary font-label">{t('settings.passwordSuccess')}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={passwordBusy}
                    onClick={() => void handleUpdatePassword()}
                    className="rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-md shadow-primary-container/20 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                  >
                    {passwordBusy ? t('settings.passwordSubmitting') : t('settings.passwordSubmit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside title={t('settings.securityTitle')} description={t('settings.securityDesc')} />
            <div className="w-full md:w-2/3">
              <div className="space-y-6 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm dark:border-outline-variant/25">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 dark:border-outline-variant/20">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed text-tertiary">
                      <span className="material-symbols-outlined">shield_person</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface">{t('settings.twoFactor')}</p>
                      <p className="text-xs text-on-surface-variant">{t('settings.twoFactorHint')}</p>
                    </div>
                  </div>
                  <Switch checked={twoFactor} onChange={setTwoFactor} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-r-xl border-l-4 border-tertiary bg-tertiary-fixed/20 p-4 dark:bg-tertiary-fixed/10">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="material-symbols-outlined shrink-0 text-tertiary">warning</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-tertiary">{t('settings.recovery')}</p>
                      <p className="text-xs text-on-tertiary-fixed-variant">{t('settings.recoveryHint')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.alert(t('settings.recoveryNotEnabled'))}
                    className="shrink-0 text-xs font-bold uppercase tracking-widest text-tertiary hover:underline"
                  >
                    {t('settings.view')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside
              title={t('settings.notificationsTitle')}
              description={t('settings.notificationsDesc')}
            />
            <div className="w-full md:w-2/3">
              <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm dark:border-outline-variant/25">
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 border-b border-surface-container pb-4 text-sm font-bold uppercase tracking-tight text-on-surface">
                      {t('settings.emailAlerts')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-on-surface font-body">{t('settings.emailMonthly')}</span>
                        <Switch checked={emailMonthly} onChange={setEmailMonthly} size="sm" />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-on-surface font-body">Collaborator suggestions</span>
                        <Switch checked={emailCollaborator} onChange={setEmailCollaborator} size="sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-4 border-b border-surface-container pb-4 text-sm font-bold uppercase tracking-tight text-on-surface">
                      {t('settings.pushAlerts')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-on-surface font-body">{t('settings.pushSync')}</span>
                        <Switch checked={pushSync} onChange={setPushSync} size="sm" />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-on-surface font-body">{t('settings.pushTagging')}</span>
                        <Switch checked={pushTagging} onChange={setPushTagging} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside title={t('settings.sessionTitle')} description={t('settings.sessionDesc')} />
            <div className="w-full md:w-2/3">
              <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 dark:border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high sm:w-auto sm:px-8"
                >
                  {t('sidebar.logout')}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <SectionAside
              title={t('settings.dangerTitle')}
              description={t('settings.dangerDesc')}
              titleClassName="text-error"
            />
            <div className="w-full md:w-2/3">
              <div className="space-y-6 rounded-xl border border-error/25 bg-error-container/15 p-8 dark:border-error/30 dark:bg-error-container/20">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 dark:border-outline-variant/20">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
                      <span className="material-symbols-outlined">visibility_off</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface">{t('settings.hideLibraryTitle')}</p>
                      <p className="text-xs text-on-surface-variant">{t('settings.hideLibraryHint')}</p>
                    </div>
                  </div>
                  <Switch checked={libraryHidden} onChange={setLibraryHidden} />
                </div>
                <p className="text-xs text-on-surface-variant">{t('settings.hideLibrarySaveHint')}</p>
                <div className="flex flex-col items-start justify-between gap-4 border-t border-error/15 pt-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold text-error">{t('settings.deleteAccount')}</p>
                    <p className="text-xs text-on-surface-variant">{t('settings.deleteHint')}</p>
                    {deleteError ? <p className="mt-2 text-sm font-medium text-error">{deleteError}</p> : null}
                  </div>
                  <button
                    type="button"
                    disabled={deleteBusy}
                    onClick={() => void handleDeleteAccount()}
                    className="shrink-0 rounded-lg bg-error px-4 py-2 text-xs font-bold text-on-error transition-colors hover:opacity-90 disabled:opacity-60"
                  >
                    {deleteBusy ? t('settings.deleteWorking') : t('settings.deleteBtn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-8 right-6 z-[45] flex flex-col items-end gap-3 sm:right-8 sm:flex-row sm:items-center sm:gap-4">
        {saveError ? (
          <span className="max-w-[14rem] text-right text-xs font-semibold text-error">{saveError}</span>
        ) : saveOk ? (
          <span className="text-xs font-bold uppercase tracking-widest text-secondary font-label">
            {t('settings.saved')}
          </span>
        ) : (
          <span className="hidden text-xs font-bold uppercase tracking-widest text-secondary font-label sm:block">
            {t('settings.draftHint')}
          </span>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-manrope text-sm font-bold text-on-primary shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 sm:px-8 sm:py-4"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden>
            save
          </span>
          {saving ? t('settings.saving') : t('settings.saveAll')}
        </button>
      </div>
    </div>
  )
}
