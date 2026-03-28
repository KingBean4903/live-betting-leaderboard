
local lbKey = KEYS[1]
local processedKey = KEYS[2]
local nomineeId = ARGV[1]
local voteId = ARGV[2]

-- check idempotency
if redis.call("SADD", processedKey, voteId) == 1 then
								return 0
end

-- mark vote s processed
redis.call("SADD", processedKey, voteId)

-- increment nominee vote count
redis.call("ZINCRBY", lbKey, 1, nomineeId)

return 1
