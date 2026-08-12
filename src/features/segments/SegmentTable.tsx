import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { Segment } from '@/features/segments/segments'

const NOTICE_ID = 'segments-read-only-notice'

export function SegmentTable({
  segments,
  onToggle,
}: {
  segments: Segment[]
  onToggle?: (id: string) => void
}) {
  const readOnly = !onToggle

  return (
    <div className="grid gap-4">
      {readOnly && (
        <Alert id={NOTICE_ID}>
          <AlertDescription>
            Your role can view segments but not change them.
          </AlertDescription>
        </Alert>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th scope="col" className="py-2 font-medium">
              Segment
            </th>
            <th scope="col" className="py-2 font-medium">
              Region
            </th>
            <th scope="col" className="py-2 font-medium">
              Status
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => {
            const action = segment.enabled ? 'Disable' : 'Enable'

            return (
              <tr key={segment.id} className="border-b last:border-0">
                <th scope="row" className="py-2 text-left font-medium">
                  {segment.name}
                </th>
                <td className="py-2 text-muted-foreground">{segment.region}</td>
                <td className="py-2">
                  {segment.enabled ? 'Enabled' : 'Disabled'}
                </td>
                <td className="py-2 text-right">
                  <Button
                    size="sm"
                    variant={segment.enabled ? 'outline' : 'default'}
                    disabled={readOnly}
                    aria-label={`${action} ${segment.name}`}
                    aria-describedby={readOnly ? NOTICE_ID : undefined}
                    onClick={() => onToggle?.(segment.id)}
                  >
                    {action}
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
