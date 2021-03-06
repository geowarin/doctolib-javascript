
## getAvailabilities(date)

`getAvailabilities` returns 7 days of slots, including date of request.
  - Each day must be generated using events of type `opening` by dividing the period between `starts_at` and `ends_at`
    into 30 minutes slots
  - if an appointment exists between those hours, subtract it from availabilities
  - `weekly_recurring` openings must be taken into account

## Questions
  - Do `starts_at` and `ends_at` always fall on 1/2h dates
  - Do `starts_at` and `ends_at` happen on the same day
  - How long should we look backwards for a `weekly_recurring` event ?

## Hypothesises
  - Yes => this should be enforced by the database
  - Yes => this should be enforced by the database
  - For the purpose of the exercise, all `weekly_recurring` event should be used. IRL, we should probably consider
    those of the current year maybe?

## TODO

- Sanitize argument date (should be a date without time)
- Ensure slots are valid (datetime - 1/2h periods)
- Validate edge cases (midnight cases, openings or appointments spanning multiple days)
    - Especially: Verify where query with `starts_at` and `ends_at`
- Validate overlapping opening/ appointments
- Timezones: the provided test uses the system TZ. Should we use UTC instead ? 
- Optimize queries
