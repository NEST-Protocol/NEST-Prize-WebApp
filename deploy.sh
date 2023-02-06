# zip bot/index.js to deploy.zip
cp -r locales bot # copy locales to bot
# shellcheck disable=SC2164
cd bot
zip -r deploy.zip index.js locales
# deploy to lambda
#aws lambda update-function-code --function-name nest-prize-bot --zip-file fileb://deploy.zip --region ap-northeast-1
aws lambda update-function-code --function-name test --zip-file fileb://deploy.zip --region ap-northeast-1
# remove deploy.zip
rm deploy.zip
