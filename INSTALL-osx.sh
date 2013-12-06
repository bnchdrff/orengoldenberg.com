#if necessary install homebrew
#ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go/install)" 

curl https://raw.github.com/creationix/nvm/master/install.sh | sh

#add nvm command see docs, add "source ~/.nvm/nvm.sh" to .profile file
#OR you can append that code to the .profile file using "echo 'source ~/.nvm/nvm.sh' >> ~/.profile"

nano .profile

#restart shell for next step

nvm install v0.10.22

nvm alias default v0.10.22

npm install -g grunt-cli

npm install -g bower

brew install rbenv

brew install ruby-build

nano .profile #eval "$(rbenv init -)"

rbenv install 1.9.3-p448

rbenv shell 1.9.3-p448

gem install bundler

rbenv rehash



#all below is related to local project

#remember you can reclone the project if you need to start over!



rbenv shell 1.9.3-p448 #this allows your to use compass

cd orengoldenberg.com

bundle install

rbenv rehash

npm install


#to run project

cd orengoldenberg.com

bower install

grunt server