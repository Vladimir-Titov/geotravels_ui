import type { ReactNode } from 'react'
import type { StepKey } from '../add-story-types'
import './add-story-step-shell.css'

interface AddStoryStepShellProps {
    step: StepKey
    title: string
    children: ReactNode
    onBack?: () => void
    onPrimaryAction: () => void
    primaryActionLabel: string
    primaryActionDisabled: boolean
    secondaryActionLabel: string
    secondaryActionDisabled?: boolean
    isPrimaryActionLoading?: boolean
}

const STEP_ORDER: StepKey[] = ['step1', 'step2', 'step3']

export const AddStoryStepShell = ({
    step,
    title,
    children,
    onBack,
    onPrimaryAction,
    primaryActionLabel,
    primaryActionDisabled,
    secondaryActionLabel,
    secondaryActionDisabled,
    isPrimaryActionLoading = false,
}: AddStoryStepShellProps) => {
    const stepIndex = STEP_ORDER.indexOf(step)
    const stepNumber = stepIndex + 1

    return (
        <section className="add-story-shell">
            <p className="add-story-shell__step-label">{`STEP ${stepNumber} OF 3`}</p>
            <h1>{title}</h1>
            <div className="add-story-shell__progress" aria-hidden>
                {STEP_ORDER.map((stepKey, index) => (
                    <span
                        key={stepKey}
                        className={
                            index === stepIndex
                                ? 'add-story-shell__progress-item add-story-shell__progress-item--active'
                                : 'add-story-shell__progress-item'
                        }
                    />
                ))}
            </div>

            <div className="add-story-shell__body">{children}</div>

            <footer className="add-story-shell__footer">
                {onBack ? (
                    <button
                        type="button"
                        className="add-story-shell__secondary-button"
                        onClick={onBack}
                        disabled={secondaryActionDisabled}
                    >
                        {secondaryActionLabel}
                    </button>
                ) : (
                    <span />
                )}
                <button
                    type="button"
                    className="add-story-shell__primary-button"
                    onClick={onPrimaryAction}
                    disabled={primaryActionDisabled}
                >
                    {isPrimaryActionLoading ? '...' : primaryActionLabel}
                </button>
            </footer>
        </section>
    )
}
