curl https://raw.github.com/creationix/nvm/master/install.sh | sh

nano .profile #add nvm command see docs

nvm install v0.10.22

nvm alias default v0.10.22

npm install -g grunt-cli

brew install rbenv

brew install ruby-build

nano .profile #eval "$(rbenv init -)"

rbenv install 1.9.3-p448

rbenv shell 1.9.3-p448

gem install bundler

rbenv rehash



#all below is related to local project

#remember you can reclone the project if necessary! 


rbenv shell 1.9.3-p448

cd orengoldenberg.com

bundle install

rbenv rehash

npm install

