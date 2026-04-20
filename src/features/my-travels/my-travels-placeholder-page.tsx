import { Link } from 'react-router-dom'
import { SurfaceCard } from '../../shared/ui'
import './my-travels-placeholder-page.css'

interface MyTravelsPlaceholderPageProps {
    title: string
    subtitle: string
}

export const MyTravelsPlaceholderPage = ({ title, subtitle }: MyTravelsPlaceholderPageProps) => {
    return (
        <div className="my-travels-placeholder">
            <SurfaceCard className="my-travels-placeholder__card">
                <p>{subtitle}</p>
                <h1>{title}</h1>
                <Link to="/my-travels">Back to dashboard</Link>
            </SurfaceCard>
        </div>
    )
}
